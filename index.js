const { Octokit } = require("@octokit/rest");
const { Base64 } = require("js-base64");
const fetch = require("node-fetch");
const { WakaTime } = require('wakatime');
//const { sha256 } = require("js-sha256").sha256;
require("dotenv").config();

const {
    GH_TOKEN: githubToken,
    WK_KEY: wakatimeKey,
} = process.env;

const client = new WakaTime(`${wakatimeKey}`);

const octokit = new Octokit({
    auth: `token ${githubToken}`,
});

async function main() {
    const sp_data = await fetch('https://spotify-np-api.vercel.app/api', {mode: 'cors'});
    const resp = await sp_data.json()
    await constructContent(resp['top'])
}

async function all_time() {
    return client.stats('all_time').then(data => {
        return `
            ${Math.floor(data.data.total_seconds/3600)+150} hr ${Math.floor((data.data.total_seconds%3600)/60)} mins
        `
    })
}

async function today() {
    return client.summaries(new Date()).then(data => {
        console.log(data)
        return data.cummulative_total.text
    })
}

async function constructContent(response) {
    let content = `
        <p align="center" style="color:blue"><samp>asheeshh</samp></p>

        <p align="center" style="color:blue">
        <samp>
            <a href="${response.url}">top track</a> .
            <a href="${response.url}">${response.song.toLowerCase()}</a> .
            <a href="${response.url}">${response.artist.toLowerCase()}</a></br>
            <a href="https://wakatime.com/@asheeshh">coding stats</a> .
            <a href="https://wakatime.com/@asheeshh">all time</a> .
            <a href="https://wakatime.com/@asheeshh">${await all_time()}</a> .
            <a href="https://wakatime.com/@asheeshh">today</a> .
            <a href="https://wakatime.com/@asheeshh">${await today()}</a>
        </samp>
        </p>

        <p align="center" style="color:blue"><samp>桜の花</samp></p>
        
        <sub><samp><a href="https://asheeshh.ninja/about/">more about me..</a></samp></sub>
    `
    const prevCont = await octokit.repos.getContent({
        owner: "asheeeshh",
        repo: "asheeeshh",
        path: "README.md"
    })
    //console.log(content)
    await updateRepo(Base64.encode(content.replace(/[`\t\n\r]+/g, '').trim()), prevCont.data.sha)
}

async function updateRepo(cont, hash) {
    try {
        const { data } = await octokit.repos.createOrUpdateFileContents({
            // replace the owner and email with your own details
            owner: "asheeeshh",
            repo: "asheeeshh",
            path: "README.md",
            message: "update readme",
            content: cont,
            sha: hash,
            committer: {
                name: `Octokit Bot`,
                email: "asheeshh9@gmail.com",
            },
            author: {
                name: "Octokit Bot",
                email: "asheeshh9@gmail.com",
            },
        });
        console.log(data)
    } catch(err) {
        console.error(err)
    }
}

main();
