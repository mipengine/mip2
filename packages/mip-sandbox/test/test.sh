# echo "==== mocha test ===="
# echo ""

# mocha test/node/**/*.spec.js

# if [ $? -ne 0 ]; then
#   echo "==== error in mocha test ===="
#   exit 1
# fi

echo "==== karma test ===="
echo ""

karma start test/karma.config.js

if [ $? -ne 0 ]; then
  echo "==== error in karma test ===="
  exit 1
fi
