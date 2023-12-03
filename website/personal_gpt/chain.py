from langchain.document_loaders import TextLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI


class GptChain:

    def __init__(self, file_to_load: str, file_encoding: str, llm_model: str):
        loader_file = TextLoader(file_to_load, encoding=file_encoding)
        self.index = VectorstoreIndexCreator().from_loaders([loader_file])
        self.chain = ConversationalRetrievalChain.from_llm(llm=ChatOpenAI(model=llm_model),
                                                           retriever=self.index.vectorstore.as_retriever(
                                                               search_kwargs={"k": 1}))
