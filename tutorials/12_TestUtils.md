# Test Utils
These are various utils that are supposed to help you achieve commonly needed tasks when doing UI tests.

## Clear files
This can be used for clearing downloads or reports files from previous runs.

## Check for file
This can be used for checking whether a specific file (most often by file ending) has been downloaded to a specific folder.

## Take screenshot on failure
This is useful for being able to see what happened when tests failed in DevOps. It will take a screenshot of the whole page and save it with the specified file name if a test fails. The error will be rethrown so that no information on the error is lost. 

## Track timed out request
This is useful when navigation timeout errors occur.
When loading pages, we wait for all requests to finish (currently 60 seconds wait time).
If you get errors nonetheless, please use this function for reporting the URLs that took longer to load.
We already blacklisted some URLs which have shown timeout functions without being necessary for D365 to work.