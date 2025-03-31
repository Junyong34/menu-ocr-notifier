#!/bin/sh

# 서버 시작 (빌드된 앱 실행)
node dist/index.js &
SERVER_PID=$!

echo "서버 프로세스 시작됨 (PID: $SERVER_PID)"

# 서버가 준비될 때까지 기다림
echo "서버가 준비될 때까지 대기 중..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  sleep 2
  if curl -s http://localhost:3890/ > /dev/null; then
    echo "서버가 준비되었습니다!"
    break
  fi
  echo "서버 준비 대기 중... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "서버 시작 타임아웃. 서버가 준비되지 않았습니다."
  exit 1
fi

# cron 시작 API 호출
echo "cron 작업 시작 중..."
curl -X GET http://localhost:3890/api/cron/start
echo "cron 작업 시작됨"

# 메인 프로세스가 종료되지 않도록 대기
wait $SERVER_PID 