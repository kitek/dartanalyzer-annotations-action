const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

const { GITHUB_TOKEN, GITHUB_WORKSPACE } = process.env;

async function main() {
    try {
        const output = await runAnalyzer();
        const annotations = parseOutput(output);
        await createCheck(annotations);
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function runAnalyzer() {
    let output = '';
    const workingDir = core.getInput('working-directory') || '.';
    const options = {
        cwd: workingDir,
    };
    options.listeners = {
        stderr: (data) => {
            output += data.toString();
        }
    };

    await exec.exec('dartanalyzer --format machine --options analysis_options.yaml ./lib', [], options);

    return output.trim();
}

function parseOutput(output) {
    let annotations = [];
    if (output.length == 0) return annotations;

    const lines = output.trim().split(/\r?\n/);
    const cwd = `${process.cwd()}/`;

    lines.forEach(line => {
        const values = line.split('|');

        const type = values[2];
        const filePath = values[3].replace(cwd, '');
        const lineNumber = parseInt(values[4], 10);
        const colStart = parseInt(values[5], 10);
        const colEnd = colStart + parseInt(values[6], 10);
        const docLink = `https://dart-lang.github.io/linter/lints/${type}.html`;
        const message = `${values[7]}\n${docLink}`;

        const annotation = {
            path: filePath,
            start_line: lineNumber,
            end_line: lineNumber,
            start_column: colStart,
            end_column: colEnd,
            annotation_level: 'warning',
            message: message,
        };
        annotations.push(annotation);
    });

    return annotations.slice(0, 49);
}

async function createCheck(annotations) {
    if (annotations.length == 0) return;

    const checkName = core.getInput('check_name');
    const octokit = new github.GitHub(String(GITHUB_TOKEN));
    const req = Object.assign({}, github.context.repo, { ref: core.getInput('commit_sha') });
    const res = await octokit.checks.listForRef(req);
    const check_run_id = res.data.check_runs.filter(check => check.name === checkName)[0].id;
    const update_req = Object.assign({}, github.context.repo, {
        check_run_id,
        output: {
            title: 'failures detected',
            summary: `${annotations.length} errors(s) found`,
            annotations
        }
    });
    await octokit.checks.update(update_req);

    core.setFailed(`${annotations.length} errors(s) found`);
}

main();
