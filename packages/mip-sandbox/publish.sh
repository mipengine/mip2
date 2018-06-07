npm install
npm run test

if [ $? -ne 0 ]; then
  echo "============"
  echo "test fail"
  exit 1
fi

npm publish --registry=http://registry.npmjs.org

if [ $? -ne 0 ]; then
  echo "============"
  echo "publish fail"
  exit 1
fi
