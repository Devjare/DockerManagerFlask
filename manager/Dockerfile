FROM python:2.7
COPY . /manager

RUN pip install --upgrade pip
RUN pip install -r /manager/requirements.txt

WORKDIR /manager

CMD ["python", "run.py"]
