/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as github from '@actions/github'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const createComment = jest.fn().mockImplementation()

type MockComment = {
  performed_via_github_app: {
    slug: string
  }
  body: string
}

let mockData: MockComment[] = []
const validData = [
  {
    performed_via_github_app: {
      slug: 'linear'
    },
    body: 'href="https://linear.app/1234"'
  }
]

const invalidData = [
  {
    performed_via_github_app: {
      slug: 'github'
    },
    body: 'href="https://github.com/1234"'
  }
]

jest.mock('@actions/github', () => {
  const originalModule = jest.requireActual('@actions/github')

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    getOctokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          issues: {
            listComments: jest.fn().mockImplementation(() => {
              return {
                data: mockData
              }
            }),
            createComment
          }
        }
      }
    }),
    context: {
      repo: {
        owner: 'test',
        repo: 'test'
      },
      payload: {
        pull_request: {
          number: 1234
        }
      }
    }
  }
})

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let noticeMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    noticeMock = jest.spyOn(core, 'notice').mockImplementation()
  })

  it('successfully finds the linear ticket', async () => {
    mockData = validData
    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'Searching for Linear ticket link ...'
    )
    expect(noticeMock).toHaveBeenCalledWith('Found Linear ticket.')
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    mockData = invalidData
    await main.run()
    expect(runMock).toHaveReturned()

    expect(createComment).toHaveBeenCalledWith({
      issue_number: 1234,
      owner: 'test',
      repo: 'test',
      body: `No Linear ticket found for this pull request. Please link an issue in Linear by mentioning the ticket.`
    })

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'No Linear ticket found.')
  })

  it('requires a pull request', async () => {
    mockData = validData
    github.context.payload.pull_request = undefined
    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'No pull request number found in context, exiting.'
    )
  })
})
