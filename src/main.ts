import * as core from '@actions/core'
import * as github from '@actions/github'


/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = process.env.GITHUB_TOKEN as string;
    const octokit = github.getOctokit(token);
    const context = github.context;
    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Searching for Linear ticket link ...`)
    
    if(!context.payload.pull_request?.number) {
      throw new Error('No pull request number found in context, exiting.')
    }
    
    const comments = await octokit.rest.issues.listComments({
      issue_number: context.payload.pull_request?.number,
      owner: context.repo.owner,
      repo: context.repo.repo
    });

    const linearComment = comments.data.find(comment => comment.performed_via_github_app?.slug === 'linear' && comment.body?.includes('href="https://linear.app/'));
    if(linearComment) {
      core.notice(`Found Linear ticket.`);
    } else {
      await octokit.rest.issues.createComment({
        issue_number: context.payload.pull_request?.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `No Linear ticket found for this pull request. Please link an issue in Linear by mentioning the ticket.`
      });
      core.error(`No Linear ticket found.`);
      core.setFailed('No Linear ticket found.');
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
