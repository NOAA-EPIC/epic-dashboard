#!bash
echo "API_CONTENT_PATH=${API_CONTENT_PATH}"
[[ -n ${API_CONTENT_PATH} ]] || exit 1

# Requirements:
# API_TOKEN="your.Jira.personal.access.token"
# curl [might need CURL_PROXY="-x your.proxy.host:port"]
# jq - json query tool - public https://github.com/jqlang/jq/releases/
#    - minimum version: jq-1.6 from https://jqlang.github.io/jq/download/

#export JIRA_SITE="https://your.jira.site"
#export CURL_PROXY="-x your.proxy.host:port"
export API_VERSION=api/2
#format="-tsv"

(
set -x
which jq >/dev/null || [[ -e ${HOME}/bin/jq ]] \
    || wget -nv -O ${HOME}/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 \
    || curl -JLO -o ${HOME}/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64
[[ ! -e ${HOME}/bin/jq ]] && [[ -e jq-linux64 ]] && mkdir -p ${HOME}/bin && cp -p jq-linux64 ${HOME}/bin/jq
[[ -e ${HOME}/bin/jq ]] && chmod +x ${HOME}/bin/jq && export PATH=${PATH}:${HOME}/bin
rm -f jq-linux64
)
which jq && jq --version

function jiraAPI() {
    #set -x
    local query=${1:-"rest/api/2/project"}
    [[ $DEBUG = true ]] && echo "#curl ${CURL_PROXY} ${JIRA_SITE}/${query}"
    #set +x
    curl ${CURL_PROXY} --silent -H "Authorization: Bearer ${API_TOKEN}" "${JIRA_SITE}/${query}" | egrep '^{|^\['
}

function getProjectKeys() {
    [[ -f projects.json ]] && jq -r '.[]|(.key)' projects.json | tr '\n' ' ' | tr -d '\r' \
        || jiraAPI "rest/${API_VERSION}/project" 2>/dev/null | jq -r '.' | tee projects.json | jq -r '.[]|(.key)'
}

function getIssuesOfProject() {
    local projectKey="$1"
    [[ -n "$1" ]] && projectKey="$1" || return 1
    
    local issuesfile="issuesOf+${projectKey}"
    [[ -f ${issuesfile}.json ]] && return 0
    
    local API_VERSION="api/2"
    local API_QUERY='search?jql=project='${projectKey}'&maxResults=1'
    echo "${JIRA_SITE}/rest/${API_VERSION}/${API_QUERY}" >&2
    first=$(jiraAPI "rest/${API_VERSION}/${API_QUERY}")
    local total=$(echo "$first" | jq -r '.total')
    local next=0
    local max=200
    echo -n '{"expand":"schema,names","startAt":0,"maxResults":'${max}',"total":'${total}',"issues":' | tee ${issuesfile}.json >&2
    echo "" >&2
    while [[ $next -le $total ]] ; do
        API_QUERY='search?jql=project='${projectKey}'&maxResults='${max}'&startAt='${next}
        echo "${JIRA_SITE}/rest/${API_VERSION}/${API_QUERY} until=${total}" >&2
        issues=$(jiraAPI "rest/${API_VERSION}/${API_QUERY}" | jq -c '.issues')
        echo "${issues}" | tee -a ${issuesfile}.json >/dev/null
        let next+=${max}
    done
    echo '}' | tee -a ${issuesfile}.json >&2
    sed -z 's/\]\n\[/,\n/g' -i ${issuesfile}.json
}

function getIssue() {
    local issueKey="$1"
    [[ -n "$1" ]] && issueKey="$1" || return 1
    local projectKey=$(echo ${issueKey} | cut -d- -f1)
    local json=""
    [[ ! -f issuesOf+${projectKey}.json ]] && getIssuesOfProject ${projectKey} >/dev/null
    if [[ -f issuesOf+${projectKey}.json ]] ; then
        jq --arg issueKey "${issueKey}" -r '.issues[]| select(.key==$issueKey)' issuesOf+${projectKey}.json 2>/dev/null
    elif [[ -f issue+${issueKey}.json ]] ; then
        cat issue+${issueKey}.json
    else
        local API_VERSION="api/2"
        local API_QUERY="issue/${issueKey}"
        DEBUG=false jiraAPI "rest/${API_VERSION}/${API_QUERY}"     | jq -r '.' | tee issue+${issueKey}.json
    fi
}

function getIssueKey() {
    local issueKey="$1"
    [[ -n "$1" ]] && issueKey="$1" || return 1
    local keyType=${2:-"key"}
    [[ $keyType = self ]] && keyType=key
    [[ $keyType = parent ]] && keyType=fields.customfield_10108
    [[ $keyType = child ]] && keyType=fields.customfield_10102
    getIssue $issueKey | jq -r '. | (.'${keyType}')'
}

function getChildKeysOf() {
    local issueKey="$1"
    [[ -n "$1" ]] && issueKey="$1" || return 1
    local issue=$(getIssue ${issueKey})
    local projectKey=$(echo ${issueKey} | cut -d- -f1)
    [[ ${projectKey} = ESP ]] && getIssuesOfProject EPIC
    [[ ${projectKey} = EPIC ]] && getIssuesOfProject ECC
    if [[ ${projectKey} = ECC ]] ; then
        for key in $(getProjectKeys) ; do
            getIssuesOfProject $key
        done
    fi
    for key in $(getProjectKeys) ; do
        projectfile=issuesOf+${key}.json
        cat ${projectfile} | jq --arg issueKey "${issueKey}" -r '.issues[]| select(.fields.customfield_10108==$issueKey)|(.key)' | tr '\n' ' ' | tr -d '\r' # children
        cat ${projectfile} | jq --arg issueKey "${issueKey}" -r '.issues[]| select(.fields.customfield_10102==$issueKey)|(.key)' | tr '\n' ' ' | tr -d '\r' # tasks
    done
}

function getChildIssuesOf() {
    local issueKey="$1"
    [[ -n "$1" ]] && issueKey="$1" || return 1
    local API_VERSION="api/2"
    local API_QUERY='search?jql=issuekey%20in%20childIssuesOf("'${issueKey}'")&maxResults=1000'
    DEBUG=false jiraAPI "rest/${API_VERSION}/${API_QUERY}" | jq -r '.'
}

function printIssue() {
    local issueKey="$1"
    [[ -n "$1" ]] && issueKey="$1" || return 1
    local format=${2:-"-text"}
    [[ ${format} =~ text ]] && getIssue $issueKey | \
        jq -r '.| (.fields.customfield_10108) + ":" + (.fields.customfield_10102) + " -> "  + (.key) + " [" + (.fields.status.name) + "] = [" + (.fields.issuetype.name) + "] " + (.fields.summary)'
    [[ ${format} =~ tsv ]] && getIssue $issueKey | \
        jq -r '.| (.fields.customfield_10108) + ":" + (.fields.customfield_10102) + "<xTABx>"  + (.key) + "<xTABx>" + (.fields.status.name) + "<xTABx>" + (.fields.issuetype.name) + "<xTABx>" + (.fields.summary)' \
        | tr '\t' ' ' | sed 's/<xTABx>/\t/g'
    [[ ${format} =~ html ]] && getIssue $issueKey | \
        jq -r '.| "<tr><td>" + (.fields.customfield_10108) + ":" + (.fields.customfield_10102) + "</td><td>"  + (.key) + "</td><td>" + (.fields.status.name) + "</td><td>" + (.fields.issuetype.name) + "</td><td>" + (.fields.summary) + "</td></tr>"'
}

function printIssueKey() {
    local issueKey="$1"
    [[ -n "$1" ]] && issueKey="$1" || return 1
    getIssue $issueKey | jq -r '.|.key'
}

function printChildren() { # Recursive.
    local issueKey="$1"
    [[ -n ${issueKey} ]] || return 0

    local pad="$2"
    local format="$3"
    #echo "# getChildKeysOf(${issueKey}) ..."
    for key in $(getChildKeysOf ${issueKey}) ; do
        echo -n "${pad} " ; printIssue "${key}" ${format}
        printChildren "${key}" "  ${pad}" ${format}
    done
}

function printPlan() {
    local issueKey="$1"
    local format="$2" # -html, -tsv, -text [default]
    [[ -n "$1" ]] && issueKey="$1" || return 1
        
    local pad=""
    echo -n "${pad}" ; printIssue "${issueKey}" ${format}
    printChildren "${issueKey}" "  ${pad}" ${format}
}

#set -x
issueKey=$(basename ${API_CONTENT_PATH})
projectKey=$(echo ${issueKey} | cut -d- -f1)
API_QUERY="${API_CONTENT_PATH}"
#set +x

echo "issueKey=${issueKey}"
echo "projectKey=${projectKey}"
echo ""

if [[ ${API_CONTENT_PATH} =~ issue/ ]] ; then
  [[ -n ${issueKey} ]] && [[ ! -f issue.${issueKey}.json ]] && echo "${JIRA_SITE}/rest/${API_VERSION}/issue/${issueKey}" \
    && getIssue ${issueKey} | tee issue+${issueKey}.json > /dev/null
  [[ -n ${issueKey} ]] && printIssue "${IssueKey}" ${format} | tee issue+${issueKey}.txt
fi

if [[ ${API_CONTENT_PATH} =~ project/ ]] ; then
    echo "${JIRA_SITE}/rest/${API_VERSION}/search?jql=project='${projectKey}'&maxResults=1"
    getIssuesOfProject ${projectKey}
fi

if [[ ${API_CONTENT_PATH} =~ planOf/  ]] ; then
    printPlan ${issueKey} ${format} | tee planOf-${issueKey}${format}.txt
fi

if [[ ${API_CONTENT_PATH} =~ childOf/  ]] ; then
    API_QUERY='search?jql=issuekey%20in%20childIssuesOf("'${issueKey}'")&maxResults=1000'
    echo "${JIRA_SITE}/rest/${API_VERSION}/${API_QUERY}"
    getChildIssuesOf ${issueKey} | tee childOf+${issueKey}.json #> /dev/null
fi
