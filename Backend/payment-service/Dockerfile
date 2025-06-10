FROM python:3.13-slim

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN pip install --upgrade pip


WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .


COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

#switch to non-root user
USER appuser

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "payments.wsgi:application"]