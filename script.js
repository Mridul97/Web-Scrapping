const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
let $;
let data = {};

function linkGenerator(error, response, body){
    if(!error && response.statusCode == 200){
        // fs.writeFileSync("index.html", body);
        $ = cheerio.load(body);

        let alltopics = $(".no-underline.d-flex.flex-column.flex-justify-center");
        let allTopicNames = $(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");

        console.log(typeof alltopics);
        // console.log(alltopics);
        console.log(alltopics.length);

        for(let x = 0; x < alltopics.length; x++) {
            getTopicPage($(allTopicNames[x]).text().trim(), "https://github.com/" + $(alltopics[x]).attr("href"));
            // console.log($(allTopicNames[x]).text().trim());
            // console.log("https://github.com/" + $(alltopics[x]).attr("href"));

        }
    }
    // console.log(response);
}

function getTopicPage(name, url){
    // url request => html page save
    request(url, function (error, response, body){
        if(!error && response.statusCode == 200){
            // fs.writeFileSync(`${name}.html`, body);
            $ = cheerio.load(body);

            let allRepos = $(".f3.color-text-secondary.text-normal.lh-condensed .text-bold");

            if(allRepos.length > 8){
                allRepos = allRepos.slice(0,8);
            }
            
            for(let x = 0; x < allRepos.length; x++){
                let repoTitle = $(allRepos[x]).text().trim();
                let repoLink = "https://github.com/" + $(allRepos[x]).attr("href");
                if(!data[name]){
                    data[name] = [{ "name": repoTitle, "link": repoLink}];
                }else{
                    data[name].push({ name: repoTitle, link: repoLink});
                }
                // getIssuePage
                getIssuesPage(name, repoTitle, repoLink + "/issues");
            }
        }
    });
}

function getIssuesPage(topicName, repoName, url){

    request(url, function(error, res, body){

        let $ = cheerio.load(body);

        let allIssues = $(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open");

        for(let x = 0; x < allIssues.length; x++){
            let issueName = $(allIssues[x]).text().trim();
            let issueLink = "https://github.com/" + $(allIssues[x]).attr("href");

            let index = -1;
            for(let i = 0; i < data[topicName].length; i++){
                if(data[topicName][i].name === repoName){
                    index = i;
                    break;
                }
            }

            if(data[topicName][index].issues === undefined){
                data[topicName][index].issues = [{issueName, issueLink}];
            }else{
                data[topicName][index].issues.push({issueName, issueLink});
            }
        }

        fs.writeFileSync("data.json", JSON.stringify(data));

    });

}

request("https://github.com/topics", linkGenerator);

