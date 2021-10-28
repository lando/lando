exports.handler = async event => {
  const pathParts = event.path.split('/');
  const status = (pathParts[pathParts.length - 1] === 'status') ? 'ok' : pathParts[pathParts.length - 1];
  return {
    statusCode: 200,
    body: JSON.stringify({status}),
  };
};
