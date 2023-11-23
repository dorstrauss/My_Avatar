import os
import json
import datetime
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import DirectoryLoader, TextLoader, WebBaseLoader
from langchain.indexes import VectorstoreIndexCreator
from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import JsonResponse


class HomeView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['DID_API'] = {'url': 'https://api.d-id.com', 'key': os.environ.get('D-ID_API_KEY')}
        return context


def chatbot(request):
    answer_words_limit = 35

    input = json.loads(request.body.decode('utf-8'))['input_text']
    instruction_text = f'when you answer back talk in first person as you are dor, ' \
                       f'and give answers no longer than {answer_words_limit} words.'
    query = input + '\n' + instruction_text

    # there is an option to add data from the internet
    more_data = [
        "https://aws.amazon.com/blogs/devops/using-generative-ai-amazon-bedrock-and-amazon-codeguru-to-improve-code-quality-and-security/",
        "https://aws.amazon.com/blogs/compute/building-a-serverless-document-chat-with-aws-lambda-and-amazon-bedrock/"
    ]
    # loader_web = WebBaseLoader(more_data)

    chat_history = []

    start_time = datetime.datetime.now()
    result = chain({"question": query, "chat_history": chat_history})
    end_time = datetime.datetime.now()
    elapsed_time = end_time - start_time
    print(f'gpt took {elapsed_time}')
    print(result['answer'])
    return JsonResponse({'answer': result['answer']})


# code outside because I want to index the data once when the server is starting
print('Start indexing personal data')
loader_file = TextLoader("website/personal_gpt/personal_data.txt", encoding='UTF-8')
index = VectorstoreIndexCreator().from_loaders([loader_file])
chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    retriever=index.vectorstore.as_retriever(search_kwargs={"k": 1}),
)
print('Finished indexing')

