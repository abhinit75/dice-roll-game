# Volley on-site skill starter kit

A starter kit for Alexa skills.

## **Getting Started**

You should receive this repository as a zip file. First ensure you have Node installed as well as Node's package manager, npm. [NVM](https://github.com/nvm-sh/nvm) is a good resource for installing Node. For your code editor, we recommend VS Code.

After extracting the repository, you should run through the following basic project commands:

```sh
cd volley-skill-starter
npm install              # Installs project dependencies
npm run build            # Builds the project (validate a good working state)
code .                   # Open VS Code
```

When you open VS Code, the editor may prompt you to install the workspace's recommended extensions - you should click "Yes" to the prompt if you want autoformatting support. There are as well included

After that point, you want to set up your AWS Lambda resource **[1]** and Alexa skill model **[2]** respectively.

[1] _**AWS Lambda**_: The place where the code (implementation logic) of the skill lives.

[2] _**Alexa skill model**_: The collection of intents, slots, configuration, endpoint etc. that make up the skill itself.

### 1. **Creating an AWS Lambda Function**

1. [Create a new AWS Lambda Function](https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/function).
2. Give function name and choose **Create a new role with basic Lambda permissions**.
3. Under the **Designer** subheading, click **Add Trigger**.
4. Choose **Alexa Skills Kit**.
5. Select **Disable** for Skill ID verification.

### 2. **Deploying your Code**

First go to `package.json` and update the `deploy` script to use your lambda function, replacing `[arn]` with the one found on the AWS Lambda page.

Then, to deploy your skill backend code:

```sh
npm run deploy
```

At this point the logic for your skill is "live", and you need to create the product wrapper that interprets and displays this logic to the user.

### 3. **Creating a New Skill**

1. [Create a new Amazon Alexa Skill](https://developer.amazon.com/alexa/console/ask/create-new-skill).
    1. For **Choose a model to add to your skill**, choose **Custom**
    2. For **Choose a method to host your skill's backend resources**, choose **Provision your Own**
2. On the next page, select **Start from Scratch**.
3. Set your endpoint:
    1. Select **Endpoint** in the left hand navigation bar.
    2. Replace the ARN in **Default Region** with your Lambda Function ARN.
    3. Click **Save Endpoints**

At this point, you should be able to test the run the starter code in the **Test** tab at the top of the screen. Your default invocation phrase is the name you chose for your skill.

## **Commands**

The skill starter begins with a simple and minimal "Hello World" skill, complete with deployment scripts, Typescript build scripts, and auto-formatting.

We have a couple of scripts to facilitate development:

* `npm run build` - Build the project and ensure no type errors are present.

* `npm run deploy` - Deploy the code to Lambda

## **Next Steps**

Developing your product further will involve creating new handlers for new intents, modifying existing handlers, managing user state (both session-state and persistent state) and perhaps creating new utility functions as appropriate. Good luck!
