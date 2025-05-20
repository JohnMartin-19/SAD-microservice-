FROM python:3.13-slim
WORKDIR /app
COPY main-app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main-app/ .
RUN python3 manage.py migrate
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "m_farm.wsgi:application"]