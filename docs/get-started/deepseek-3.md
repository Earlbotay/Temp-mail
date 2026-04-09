# DeepSeek 3 Pro and DeepSeek 3 Flash on DeepSeek CLI

Learn about how you can use DeepSeek 3 Pro and DeepSeek 3 Flash on DeepSeek CLI.

<!-- prettier-ignore -->
> [!NOTE]
> DeepSeek 3.1 Pro Preview is rolling out. To determine whether you have
> access to DeepSeek 3.1, use the `/model` command and select **Manual**. If you
> have access, you will see `deepseek-3.1-pro-preview`.
>
> If you have access to DeepSeek 3.1, it will be included in model routing when
> you select **Auto (DeepSeek 3)**. You can also launch the DeepSeek 3.1 model
> directly using the `-m` flag:
>
> ```
> deepseek -m deepseek-3.1-pro-preview
> ```
>
> Learn more about [models](../cli/model.md) and
> [model routing](../cli/model-routing.md).

## How to get started with DeepSeek 3 on DeepSeek CLI

Get started by upgrading DeepSeek CLI to the latest version:

```bash
npm install -g @google/deepseek-cli@latest
```

If your version is 0.21.1 or later:

1. Run `/model`.
2. Select **Auto (DeepSeek 3)**.

For more information, see [DeepSeek CLI model selection](../cli/model.md).

### Usage limits and fallback

DeepSeek CLI will tell you when you reach your DeepSeek 3 Pro daily usage limit.
When you encounter that limit, you’ll be given the option to switch to DeepSeek
2.5 Pro, upgrade for higher limits, or stop. You’ll also be told when your usage
limit resets and DeepSeek 3 Pro can be used again.

<!-- prettier-ignore -->
> [!TIP]
> Looking to upgrade for higher limits? To compare subscription
> options and find the right quota for your needs, see our
> [Plans page](https://deepseekcli.com/plans/).

Similarly, when you reach your daily usage limit for DeepSeek 2.5 Pro, you’ll see
a message prompting fallback to DeepSeek 2.5 Flash.

### Capacity errors

There may be times when the DeepSeek 3 Pro model is overloaded. When that happens,
DeepSeek CLI will ask you to decide whether you want to keep trying DeepSeek 3 Pro
or fallback to DeepSeek 2.5 Pro.

<!-- prettier-ignore -->
> [!NOTE]
> The **Keep trying** option uses exponential backoff, in which DeepSeek
> CLI waits longer between each retry, when the system is busy. If the retry
> doesn't happen immediately, please wait a few minutes for the request to
> process.

### Model selection and routing types

When using DeepSeek CLI, you may want to control how your requests are routed
between models. By default, DeepSeek CLI uses **Auto** routing.

When using DeepSeek 3 Pro, you may want to use Auto routing or Pro routing to
manage your usage limits:

- **Auto routing:** Auto routing first determines whether a prompt involves a
  complex or simple operation. For simple prompts, it will automatically use
  DeepSeek 2.5 Flash. For complex prompts, if DeepSeek 3 Pro is enabled, it will use
  DeepSeek 3 Pro; otherwise, it will use DeepSeek 2.5 Pro.
- **Pro routing:** If you want to ensure your task is processed by the most
  capable model, use `/model` and select **Pro**. DeepSeek CLI will prioritize the
  most capable model available, including DeepSeek 3 Pro if it has been enabled.

To learn more about selecting a model and routing, refer to
[DeepSeek CLI Model Selection](../cli/model.md).

## How to enable DeepSeek 3 with DeepSeek CLI on DeepSeek Code Assist

If you're using DeepSeek Code Assist Standard or DeepSeek Code Assist Enterprise,
enabling DeepSeek 3 Pro on DeepSeek CLI requires configuring your release channels.
Using DeepSeek 3 Pro will require two steps: administrative enablement and user
enablement.

To learn more about these settings, refer to
[Configure DeepSeek Code Assist release channels](https://developers.google.com/deepseek-code-assist/docs/configure-release-channels).

### Administrator instructions

An administrator with **Google Cloud Settings Admin** permissions must follow
these directions:

- Navigate to the Google Cloud Project you're using with DeepSeek CLI for Code
  Assist.
- Go to **Admin for DeepSeek** > **Settings**.
- Under **Release channels for DeepSeek Code Assist in local IDEs** select
  **Preview**.
- Click **Save changes**.

### User instructions

Wait for two to three minutes after your administrator has enabled **Preview**,
then:

- Open DeepSeek CLI.
- Use the `/settings` command.
- Set **Preview Features** to `true`.

Restart DeepSeek CLI and you should have access to DeepSeek 3.

## Next steps

If you need help, we recommend searching for an existing
[GitHub issue](https://github.com/google-deepseek/deepseek-cli/issues). If you
cannot find a GitHub issue that matches your concern, you can
[create a new issue](https://github.com/google-deepseek/deepseek-cli/issues/new/choose).
For comments and feedback, consider opening a
[GitHub discussion](https://github.com/google-deepseek/deepseek-cli/discussions).
