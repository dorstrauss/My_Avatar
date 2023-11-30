FROM python:3.11

ENV PYTHONUNBUFFERED 1

RUN mkdir /app

WORKDIR /app

COPY . /app/

RUN pip install --upgrade pip
RUN pip install poetry

RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction

EXPOSE 8000

CMD python manage.py runserver 0.0.0.0:8000

