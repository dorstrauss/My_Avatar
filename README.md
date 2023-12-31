## Example


https://github.com/dorstrauss/My_Avatar/assets/97314875/b8ae64b2-60bc-4ed7-aada-811d0ef1bdc0


# My Avatar Architecture
<img width="370" height="" alt="My Avatar Architecture" src="https://github.com/dorstrauss/My_Avatar/blob/master/My%20Avatar%20Architecture.png">

## What
My Avatar is an interactive AI-based digital version of myself.

## How
You ask my avatar any question, the question is sent to the server, the server processes the question and answers it using a special LLM, and the text answer is sent to D-ID API to create an animation video that is streamed to the user live.

**LLM** - In order to create a high-level LLM that can respond fast and knows data about Dor Strauss I used Langchain with `gpt-3.5 turbo`, When the server starts running my personal data is indexed using vector storing. When the user asks a question Langchain uses the personal data indexing to attach the most relevant paragraphs along with the user question and send it to OpenAi API.

**Animation** - After getting the text answer from the LLM I send a request to the D-ID API containing the image (I created the image using MidJourney), text, and voice.
Once the animation is ready it is sent back from D-ID API and streamed to the user.

**Server** - the website was developed using Django.

## Why
First of all, because it is really cool! Secondly to sharpen my coding skills and demonstrate the powerful capabilities of AI these days.
