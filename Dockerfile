FROM python:3.11

ENV PYTHONUNBUFFERED 1

RUN mkdir /app

WORKDIR /app

COPY . /app/

RUN pip install --upgrade pip
RUN pip install poetry

RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction

ENV D-ID_API_KEY=ZG9yc2h0cmF1c3MxMUBnbWFpbC5jb20:3-b7PeWe6NSvXNZPRtMZI
ENV OPENAI_API_KEY=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

EXPOSE 8000

CMD python manage.py runserver 0.0.0.0:8000

