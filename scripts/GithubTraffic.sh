#!/bin/bash

function usage() {
    echo -e "Usage:\n[REPOSITORY=http://github.com/<org>/<project> | REPOSITORY=all] [SINCE_DATE='<date string'] [VERIFY=true] ./$(basename $0)\n"
}

[[ -n ${JOB_NAME} ]] || JOB_NAME="infrastructure/dashboard-contributors"
[[ -n ${BUILD_NUMBER} ]] || BUILD_NUMBER=0
[[ -n ${WORKSPACE} ]] || WORKSPACE=$(pwd)

##### Global Configuration #####
GITHUB_API="https://api.github.com"
[[ -n ${S3_PROD_SITE} ]] || S3_PROD_SITE="."

##### Calling Environment #####
#CURL_PROXY="-x proxy.ext.ray.com:80"
#[[ -n ${HTTP_PROXY} ]] && CURL_PROXY="" || CURL_PROXY="-x proxy.ext.ray.com:80"
#ACCEPT="-H \"Accept: application/vnd.github+json\""
#OAUTH2="-H \"Authorization: http://www.Bearer.com $(cat ~/.api/github-Metrics.tok)\""
#VERSION="-H \"X-GitHub-Api-Version: 2022-11-28\""
curl_opt="-s -k"

[[ -n ${REPOSITORY} ]] && [[ -n ${SINCE_DATE} ]] || usage 
[[ -n ${REPOSITORY} ]] || REPOSITORY="https://github.com/ufs-community/ufs-srweather-app"
[[ ${REPOSITORY} == all ]] || PROJECT_NAME=$(basename $(echo ${REPOSITORY} | grep -v "^#"))
[[ -n ${ORG} ]] || ORG="ufs-community"
[[ -n ${PROJECT_NAME} ]] || PROJECT_NAME="ufs-srweather-app"
#SINCE_DATE="08 weeks ago"
#UNTIL_DATE=2023-03-23T00-00-00Z
[[ -n $SINCE_DATE ]] && SINCE=$(date --date="$SINCE_DATE" +'%Y-%m-%d') || SINCE=$(date --date="-1 month" +'%Y-%m-%d')
[[ -n $UNTIL_DATE ]] && UNTIL=$(date --date="$UNTIL_DATE" +'%Y-%m-%d') || UNTIL=$(date --date="today"   +'%Y-%m-%d')

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

function commits() {
        local PIPELINE_PROJECT=$1
        local commit_records=100
        if [[ -d ${PIPELINE_PROJECT}/.git/ ]] ; then
                echo "# git -C ${PIPELINE_PROJECT} log --pretty='format:{ "name":"%aN","email":"%aE","date":"NONE" }' --since="$SINCE" --until="$UNTIL"" >&2
                git -C ${PIPELINE_PROJECT} log --pretty='format:{ "name":"%aN","email":"%aE","date":"NONE" }' --since="$SINCE" --until="$UNTIL"
        else
                echo "# curl ${CURL_PROXY} ${curl_opt} -o- ${GITHUB_API}/repos/${ORG}/${PIPELINE_PROJECT}/commits?since=$SINCE&until=$UNTIL&page=1&per_page=$commit_records" >&2
                json=$(curl ${CURL_PROXY} ${curl_opt} -o- "${GITHUB_API}/repos/${ORG}/${PIPELINE_PROJECT}/commits?since=$SINCE&until=$UNTIL&page=1&per_page=$commit_records")
                message=$(echo "$json" | jq -r '.message' 2>/dev/null)
                [[ -n $message ]] && echo "#NOTE: $message" >&2 || echo "$json" | jq -c '.[].commit|.author | .date = "NONE"'
        fi
}

function commits2json() {
        local PIPELINE_PROJECT="$1"
        local PIPELINE_BRANCH="$2"
        [[ -n ${WORKSPACE} ]] || WORKSPACE="."
        echo -en "{\n"
        echo -en "\"date\": \"$(date  +'%F %H:%M:%S %z')\",\n"
        echo -en "\"project\": \"${ORG}/${PIPELINE_PROJECT}\",\n"
        echo -en "\"branch\": \"${PIPELINE_BRANCH}\",\n"
        echo -en "\"since\": \"${SINCE}\",\n"
        echo -en "\"until\": \"${UNTIL}\",\n"
        echo -en "\"activity\": "
        echo -en "[\n"
        first=true
        commits ${PIPELINE_PROJECT} | tee ${WORKSPACE}/${PIPELINE_PROJECT}-commits.json | sort | uniq -c | sort -r | \
        while read line ; do
                [[ $first == true ]] && first=false || echo ","
                n_commits=$(echo "$line" | cut -d' ' -f1) ;
                record=$(echo $line | sed "s|\"date\":\"NONE\"|\"commits\":\"$n_commits\"|g" | cut -d' ' -f2-)
                echo -en "$record"
        done
        echo -en "\n]"
        echo -en "\n}\n"
}

##### Main ####
echo "" >&2
echo "PATH=${PATH}" >&2
echo "WORKSPACE=${WORKSPACE}" >&2

pwd

echo "" >&2
echo "REPOSITORY='${REPOSITORY}'" >&2
echo "SINCE='${SINCE}'" >&2
echo "UNTIL='${UNTIL}'" >&2
echo "VERIFY='${VERIFY}'" >&2

# start clean
rm -f ${WORKSPACE}/latest.txt
rm -f ${WORKSPACE}/repo_files.txt

# All valid repos ... comment lines ('#') are excluded
echo "#https://github.com/ufs-community/regional_workflow
https://github.com/ufs-community/UFS_UTILS
#https://github.com/ufs-community/ufs
https://github.com/ufs-community/ufs-weather-model
https://github.com/ufs-community/ufs-mrweather-app
#https://github.com/ufs-community/ufs-community.github.io
https://github.com/ufs-community/ufs-s2s-app
https://github.com/ufs-community/ufs-s2s-model
https://github.com/ufs-community/ufs-srweather-app
https://github.com/ufs-community/ufs-rtma-app
https://github.com/ufs-community/ufs-test-artifacts
https://github.com/ufs-community/EPIC-GST
https://github.com/ufs-community/workflow-tools
https://github.com/ufs-community/HAFS
https://github.com/ufs-community/ccpp-physics
https://github.com/ufs-community/land-DA_workflow
https://github.com/ufs-community/land-DA
https://github.com/ufs-community/CATChem
" | grep -v "^#" > ${WORKSPACE}/repo_urls.txt

if [[ ${REPOSITORY} == all ]] ; then
    [[ -e ${WORKSPACE}/repo_urls.txt ]] && projects=$(grep -v "^#" ${WORKSPACE}/repo_urls.txt) || projects=$(curl ${CURL_PROXY} ${curl_opt} -o- "${GITHUB_API}/orgs/${ORG}/repos" | jq -r '.[].full_name' | tr -d '\r')
else
    projects=${REPOSITORY}
fi

cols='".commits",".name",".email"'
jcols=$(echo "$cols" | tr -d '"')
tcols=$(echo "$cols" | tr -d '.')

for project in $(echo $projects) ; do
        PROJECT=$(basename $project .json)
        echo "${ORG}:${PROJECT} ${SINCE} ${UNTIL}" >&2
        [[ -e ${WORKSPACE}/${PROJECT}/.git/config ]] && ls -ald ${WORKSPACE}/${PROJECT}/.git/config #|| continue
        [[ -d ${WORKSPACE}/${PROJECT}/.git/ ]] && BRANCH=$(git -C ${WORKSPACE}/${PROJECT} rev-parse --abbrev-ref HEAD) || BRANCH=default
        [[ -s ${WORKSPACE}/${PROJECT}-commits.json ]] || commits2json ${PROJECT} ${BRANCH} | tee ${WORKSPACE}/${PROJECT}.json
        [[ -s ${WORKSPACE}/${PROJECT}.json ]] && echo "${S3_PROD_SITE}/jobs/${JOB_NAME}/${BUILD_NUMBER}/${PROJECT}.json" | tee -a ${WORKSPACE}/repo_files.txt >&2
        [[ -s ${WORKSPACE}/${PROJECT}.json ]] && echo -e "\n# Show as a TSV table ..." >&2 \
            && jq -r "[$tcols], [\"-------\",\"--------------\",\"--------------\"], (.activity[] | [$jcols]) | @tsv" ${WORKSPACE}/${PROJECT}.json | column -ts $'\t' ;
done

status=${PIPESTATUS[0]}

echo -e "\n#### status=$status \n# NEXT: publish these JSON files as web pages ..."
if [[ -s ${WORKSPACE}/repo_files.txt ]] ; then
    cp ${WORKSPACE}/repo_files.txt ${WORKSPACE}/latest.txt
    echo -e "${S3_PROD_SITE}/jobs/${JOB_NAME}/latest.txt"
    echo -e ""
    cat ${WORKSPACE}/latest.txt
else
    rm -f ${WORKSPACE}/latest.txt
    echo -e "${S3_PROD_SITE}/jobs/${JOB_NAME}/${BUILD_NUMBER}/ufs-srweather-app.json"
fi
    
# Verify json with HTML from csv data and headers ...
function json2html() {
    local PIPELINE_PROJECT=$(basename $1 .json)
    [[ -n ${WORKSPACE} ]] || WORKSPACE="."
    cols='".commits",".name",".email"'
    jcols=$(echo "$cols" | tr -d '"')

    function json2csv() {
        jq -r "(.activity[] | [$jcols]) | @csv" ${WORKSPACE}/${PIPELINE_PROJECT}.json | column -ts $'\t'
    }
    
    function csv2table() { # global data="<CSV data>"
        echo "# csv2table(lines=$(echo "$data" | grep ',' | wc -l))" >&2
        [[ -z $data ]] && echo "<h4>WARNING: No data found.</h4>" && return 1
        [[ -z $1 ]] && echo "<h4>ERROR: missing caption!</h4>" && return 1
        local caption=$1
        local headers=""
        [[ -n "$2" ]] && headers="$(echo "$2" | tr -d '\n\r')"

        echo "<table class=sortable border=1>"
        #echo "<style> caption { background: #1c87c9; color: #fff; } </style>"
        echo "<style> caption { background: #1c87c9; color: #000; } </style>"
        echo "<caption> $(echo "$caption") </caption>"
        echo "<style type="text/css"> form { display:inline; margin:0px; padding:0px; } </style>"
        [[ -n "${headers}" ]] && echo "<tr bgcolor=steelblue><th>${headers//,/</th><th>}</th></tr>"
        echo "$data" | while read line ; do
                echo "$line" | cut -d, -f1-3 >&2
                line=$(echo -n "$line" | tr -d '\n\r')
                echo "<tr class=item><td>${line//,/</td><td>}</td></tr>" | tr -d '"'
        done | sort -r
        echo "</table>"
    }

    echo -e "\n# Generate a CSV ..." >&2
    json2csv | tee ${WORKSPACE}/${PIPELINE_PROJECT}.csv >/dev/null #>&2

    echo -e "\n# Generate an HTML table ..." >&2
    caption=$(jq -c '[.project,.branch,.since,.until]' ${WORKSPACE}/${PIPELINE_PROJECT}.json | tr '"' ' ' )
    echo -e "# caption=$caption" >&2
    headers=$(echo "$cols" | tr -d '."')
    echo "# headers='$headers'" >&2
    data=$(cat ${WORKSPACE}/${PIPELINE_PROJECT}.csv)

    echo -e "<HTML>\n<BODY>\n"
    csv2table "$caption" "$headers"
    echo -e "</BODY>\n</HTML>"
}

[[ true == ${VERIFY} ]] && for project in $(echo $projects) ; do
        PROJECT=$(basename $project .json)
        [[ -s ${WORKSPACE}/${PROJECT}.json ]] && json2html ${WORKSPACE}/${PROJECT}.json > ${WORKSPACE}/${PROJECT}.html
        [[ -s ${WORKSPACE}/${PROJECT}.html ]] && echo "${S3_PROD_SITE}/jobs/${JOB_NAME}/${BUILD_NUMBER}/${PROJECT}.html" >&2
done

exit $status
