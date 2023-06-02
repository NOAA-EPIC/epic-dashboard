#!/bin/bash
function usage() {
    echo -e "Usage:\n[PIPELINE_PROJECT=<project>] [subset='pattern'] [VERIFY=true] ./$(basename $0)\n"
}

[[ -n ${JOB_NAME} ]] || JOB_NAME="infrastructure/dashboard-pipeline"
[[ -n ${BUILD_NUMBER} ]] || BUILD_NUMBER=0
[[ -n ${WORKSPACE} ]] || WORKSPACE=$(pwd)

##### Global Configuration #####
#GITHUB_API="https://api.github.com"

##### Calling Environment #####
#       JENKINS_LOGIN="<jenkins-username>"
#       CURL_PROXY="-x proxy.ext.ray.com:80"

        [[ -n ${JENKINS_LOGIN} ]] || JENKINS_LOGIN="jenkins-readonly"
        [[ -z ${JENKINS_LOGIN} ]] && echo "WARNING: undefined JENKINS_LOGIN" >&2 # && exit 1

        [[ -n ${PIPELINE_PROJECT} ]] || PIPELINE_PROJECT="ufs-srweather-app"
        URL="${JENKINS_SITE}/job/${PIPELINE_PROJECT}/job/pipeline/view/change-requests"

set -x
hostname
date
id
pwd
[[ -e ${HOME}/bin/jq ]] && chmod +x ${HOME}/bin/jq && export PATH=${PATH}:${HOME}/bin
which curl && curl --version || exit 1
which jq && jq --version || exit 1
set +x

##### Functions ####
function jenkinsAPI() {
        # pre-configuration: JENKINS_LOGIN=<jenkins-username>
        local JENKINS_TOKEN_FILE="$HOME/.api/jenkins-readonly.tok"
        #[[ -n ${JENKINS_LOGIN} ]] && [[ ! -e ${JENKINS_TOKEN_FILE} ]] && echo "missing JENKINS_TOKEN_FILE" >&2
        [[ -n ${JENKINS_LOGIN} ]] && USERAUTH="-u ${JENKINS_LOGIN}:$(cat ${JENKINS_TOKEN_FILE})" || echo "undefined JENKINS_LOGIN" >&2
        local URL=""
        local FORM="api/json?pretty=true"
        local curl_opt="-s -k"

        [[ -n $1 ]] && URL="$1" || URL="${JENKINS_SITE}/job/${PIPELINE_PROJECT}/job/pipeline"
        [[ -n $2 ]] && FORM="$2" || FORM="api/json?pretty=true"
        [[ -n $DEBUG ]] && echo "#DEBUG# curl ${CURL_PROXY} -u ${JENKINS_LOGIN}:$(basename ${JENKINS_TOKEN_FILE}) ${curl_opt} ${URL}/${FORM}" >&2

        curl ${CURL_PROXY} ${USERAUTH} ${curl_opt} -X GET ${URL}/${FORM} 2>/dev/null
}

function jenkinsBlueREST() {
        [[ -n $1 ]] && URL="$(echo $1)" || URL="${JENKINS_SITE}/blue/rest/organizations/jenkins/pipelines/${PIPELINE_PROJECT}/pipelines/pipeline/branches"
        [[ -n $2 ]] && FORM="$2" || FORM=" "
        jenkinsAPI "$URL" "$FORM"
}

function s3artifacts() {
        [[ -n $1 ]] || return 1
        local URL=$1
        [[ -n $1 ]] && URL=$(echo "$1" | sed 's|/$||1') || return 2
        local S3_SITE=$2 
        [[ -n $2 ]] || S3_SITE=${S3_PROD_SITE}
        local FORM="s3/"

        DOWNLOAD=$(echo "$URL" | sed 's|/job/|/|g' | sed "s|${JENKINS_SITE}|${S3_SITE}/jobs|1")
        echo ${DOWNLOAD} >&2

        jenkinsAPI ${URL} ${FORM} \
                | tr -d '"' \
                | sed 's|<td><a href=|=|g' | sed 's|</a></td>|\n|g' \
                | cut -d= -f2 | cut -d\> -f1 \
                | grep 'download/' | sed "s|download/|${DOWNLOAD}/|g" \
                | sed 's|pipeline/view/change-requests|pipeline|g' \
                | sort
        return ${PIPESTATUS[0]}
}

function jenkinsBuilds() {
        local subset="$1"
        [[ -n "$1" ]] && subset="$1" || subset="job/PR-"

        ci_jobs=$(jenkinsAPI | jq -r '.jobs[].url' | egrep "$subset")
        ci_builds=$(for job in $ci_jobs ; do jenkinsAPI $(echo $job) | jq -r '.builds[].url'; done)

        rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-buildartifacts.txt
        echo -e "{\n \"builds\" : ["
        first=true
        for build in $ci_builds ; do
                echo "$build" >&2
                [[ $first == true ]] && first=false || echo -e "\n,"
                jenkinsAPI $(echo $build)
                for art in $(s3artifacts ${build} ${S3_PROD_SITE} 2>/dev/null) ; do
                    echo "${art}" >> ${WORKSPACE}/${PIPELINE_PROJECT}-buildartifacts.txt
                done
        done
        echo -e "\n]\n}"
}

function blueNodes() {
        local subset="$1"
        [[ -n "$1" ]] && subset="$1" || subset="branches/PR-"

        local ci_builds=$(jenkinsBlueREST | jq -r '.[]._links.self.href' | tr -d '\r' | egrep "$subset")

        rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-blueartifacts.txt
        echo -e "{\n \"builds\":["
        firstbuild=true
        for build in $ci_builds ; do
                [[ $firstbuild == true ]] && firstbuild=false || echo ","
                echo "# build='$build'" >&2
                branch=$(basename $build)
                local runs=$(jenkinsBlueREST $(echo "${JENKINS_SITE}${build}runs" | tr -d '\r') | jq -r '.[]|._links.self.href' | tr -d '\r')
                echo -e "{\n \"runs\":["
                firstrun=true
                for run in $runs ; do
                        runId=$(basename $run)
                        [[ $firstrun == true ]] && firstrun=false || echo ","

                        echo "#   jenkinsBlueREST $(echo ${JENKINS_SITE}${run}nodes | tr -d '\r')" >&2
                        local nodes=$(jenkinsBlueREST $(echo ${JENKINS_SITE}${run}nodes | tr -d '\r'))
                        jenkinsBlueREST $(echo ${JENKINS_SITE}${run} | tr -d '\r') | tr -d '\r' | sed 's|}$||' ; echo -en ",\n\"nodes\":${nodes},\n\"artifacts\":[]\n}"
                        echo "$nodes" |  jq -c '.[]' | egrep 'Initializ|manage_|cicd/scripts/' | jq -c '[.startTime,.displayDescription,.state,.durationInMillis,.result]' >&2
                        blueUrl=${JENKINS_SITE}/job/${PIPELINE_PROJECT}/job/pipeline/job/${branch}/${runId}/
                        for art in $(s3artifacts ${blueUrl} ${S3_PROD_SITE} 2>/dev/null) ; do
                            echo "${art}" >> ${WORKSPACE}/${PIPELINE_PROJECT}-blueartifacts.txt
                        done
                done
                echo -e "\n]\n}"
        done
        echo -e "\n]\n}"
}

function blueResults() {
        local file=$1
        jq -c '.builds[].runs[]' $file.json | tr -d  '\r' | \
        while read -r run; do
                echo " "
                index=$(echo "$run" | jq -c '[.pipeline,.id]' | tr -d '\r' | sed 's|,|/run/|1' | tr -d '"')
                echo -en "$index: "
                echo "$run" | jq -c '[.startTime,._links.self.href,.pipeline,.id,.state,.durationInMillis,.result,.artifacts]'
                echo "$run" | jq -c '.nodes[]' | tr -d '\r' | \
                grep "Matrix " | \
                while read -r node; do
                        next=$(echo "$node" | jq -r '.edges[].id')
                        data=$(echo "$node" | jq -c '[.id,.displayName,.durationInMillis,.result,.edges[].id]') ; echo "platform=$data"
                        while [[ "$next" != "" ]] ; do
                                node=$(echo "$run"  | jq -c ".nodes[] | select(.id == \"$next\")" | tr -d '\r')
                                next=$(echo "$node" | jq -r '.edges[].id')
                                data=$(echo "$node" | jq -c '[.id,.displayName,.durationInMillis,.result,.edges[].id]') ; echo "    data=$data"
                        done
                done
        done
}

function latest() { # find the latest PR URL ...
        jenkinsAPI ${JENKINS_SITE}/job/${PIPELINE_PROJECT}/job/pipeline/view/change-requests 2>/dev/null | tee ${WORKSPACE}/${PIPELINE_PROJECT}-jobs.json | jq -r '.jobs[].url' | sort -rn | tr -d '\r'
}

##### Main ####
echo "" >&2
echo "PATH=${PATH}" >&2
echo "WORKSPACE=${WORKSPACE}" >&2

pwd

echo "" >&2
echo "PIPELINE_PROJECT='${PIPELINE_PROJECT}'" >&2
echo "subset='$subset'" >&2
echo "VERIFY='${VERIFY}'" >&2

#### BlueOcean ####
# start clean
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-latest.txt
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-bluenodes.json
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-blueartifacts.txt
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-blueresults.txt 
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-builds.json
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-buildartifacts.txt
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-jobs.json
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-jobs.txt
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-builds.csv
rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-dashboard.html

# Accessing the BlueOcean JSON data ...
file=${PIPELINE_PROJECT}-bluenodes
blueNodes "$subset" > ${WORKSPACE}/$file.json
( set -x; cat ${WORKSPACE}/$file.json | jq -c '.builds[].runs[]' | jq -c '[._links.self.href,.type,.state,.durationInMillis,.result]' )
runs=$(cat ${WORKSPACE}/$file.json | jq -c '.builds[].runs[]' | jq -c '[.startTime,._links.self.href,.pipeline,.id,.state,.durationInMillis,.result,.pullRequest.url,.artifacts]' | tr -d '\r')
nodes=$(cat ${WORKSPACE}/$file.json | jq -c '.builds[].runs[]|[.nodes[]]' | jq -c '.[]|[.startTime,.id,._links.self.href,.displayName,.durationInMillis,.state,.result,[.edges[].id]]' | tr -d '\r' | sed 's|, SRW_COMPILER =|; SRW_COMPILER =|g' | sed 's|Matrix - ||g' | tr -d ' ')
echo -e "\n#runs:\n$runs" >&2
#echo -e "\n#nodes:\n$nodes" >&2
#for url in $(cat ${WORKSPACE}/$file.json | jq -r '.builds[].runs[]|._links.self.href' | tr -d '\r') ; do
#        echo -e "\n# $url"
#        echo "$runs" | grep "$url"
#        echo "$nodes" | grep "$url"
#done
blueResults $file | tee ${WORKSPACE}/${PIPELINE_PROJECT}-blueresults.txt
status=${PIPESTATUS[0]}

if [[ -s ${WORKSPACE}/${PIPELINE_PROJECT}-bluenodes.json ]] ; then
    echo "${S3_PROD_SITE}/jobs/${JOB_NAME}/${BUILD_NUMBER}/${PIPELINE_PROJECT}-bluenodes.json" > ${WORKSPACE}/${PIPELINE_PROJECT}-latest.txt
    echo "${S3_PROD_SITE}/jobs/${JOB_NAME}/${BUILD_NUMBER}/${PIPELINE_PROJECT}-blueartifacts.txt" >> ${WORKSPACE}/${PIPELINE_PROJECT}-latest.txt
    echo "${S3_PROD_SITE}/jobs/${JOB_NAME}/${BUILD_NUMBER}/${PIPELINE_PROJECT}-blueresults.txt" >> ${WORKSPACE}/${PIPELINE_PROJECT}-latest.txt
    cat ${WORKSPACE}/${PIPELINE_PROJECT}-latest.txt && echo -e "\n${S3_PROD_SITE}/jobs/${JOB_NAME}/${PIPELINE_PROJECT}-latest.txt\n"
else
    rm -f ${WORKSPACE}/${PIPELINE_PROJECT}-latest.txt
fi

[[ $VERIFY == true ]] || exit $status

#### NEXT: verify with a CSV and an HTML page, like ...

#### Plain Jenkins Builds ####

LATEST_URL="$(latest | tee ${WORKSPACE}/${PIPELINE_PROJECT}-jobs.txt | head -1)/1"
echo "LATEST_URL=${LATEST_URL}"
echo "##"

# Adjust some globals ...
file=${PIPELINE_PROJECT}-builds
jenkinsBuilds "$subset" > ${WORKSPACE}/$file.json

exit $status
