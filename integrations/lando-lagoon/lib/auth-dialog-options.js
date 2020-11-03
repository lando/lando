const api = require('./api');
const keys = require('./keys');

/*
 * validateRecipeIsLagoon = true will check answers.recipe === 'lagoon'
 *   With lando init, we don't know if it's the lagoon recipe, so the
 *   validation is required.
 *   With tooling, we can assume it's a lagoon recipe so the check is not required.
 *   ... also, answers.recipe is not available in tooling.
 */

const key = () => ({
  describe: 'A local SSH key file',
  string: true,
  interactive: {
    type: 'input',
    message: 'Key file',
    when: false,
    weight: 500,
  },
});

const auth = (lando, validateRecipeIsLagoon= true) => ({
  describe: 'A Lagoon SSH key',
  string: true,
  interactive: {
    type: 'list',
    // choices: keys.getKeyChoices(lando),
    choices: [],
    message: 'Select a Lagoon account',
    filter: answer => {
      if (answer === 'new') {
        // Generate a new key if user selected new.
        return keys.generateKey(lando).then(() => {
          return answer;
        });
      }
      return answer;
    },
    when: answers => {
      if (validateRecipeIsLagoon && answers.recipe !== 'lagoon') {
        return false;
      }

      // Handle passed in key
      if (answers.key) {
        answers['lagoon-auth'] = keys.getMatchingKeyOrCreatePending(lando, answers.key);
        // Run the generate key to create the output for display in the next step.
        if (answers['lagoon-auth'] === 'new') {
          return keys.generateKey(lando, 'copy').then(() => {
            return false;
          });
        }
        // We have a found key, return false.
        return false;
      }
      return true;
    },
    weight: 501,
  },
});

const newKey = (lando, validateRecipeIsLagoon= true) => ({
  hidden: true,
  string: true,
  interactive: {
    name: 'lagoon-new-key',
    type: 'input',
    message: 'Copy/paste the SSH key above into the Lagoon UI; Then press [Enter]',
    validate: () => {
      // Attempt whoami
      // When we support alternate host, port, and uri, they will need to be passed into opts here.
      const opts = {};
      // Creates/updates lagoon-pending key and writes data to cache
      keys.setPendingKey(lando, opts);

      return api.getLagoonApi('lagoon-pending', lando).whoami()
        .then(data => {
          // Set email and promote pending key and cache data
          opts.email = data.email;
          // promotePendingKey sets keys.currentKey which is used in the next step.
          keys.promotePendingKey(lando, opts);
          return true;
        })
        .catch(error => {
          // Returning a string displays it as an error and allows them to try again.
          return 'Authentication failed. Please try again.';
        });
    },
    when: answers => {
      // Print the SSH KEY for the user to copy & paste over in the Lagoon UI.
      if (validateRecipeIsLagoon && answers.recipe !== 'lagoon') {
        return false;
      }
      if (keys.lastKeyGeneratedOutput !== null) {
        process.stdout.write(keys.lastKeyGeneratedOutput);
        return true;
      }
    },
    weight: 502,
  },
});

module.exports = (lando, validateRecipeIsLagoon) => ({
  'key': key(lando, validateRecipeIsLagoon),
  'lagoon-auth': auth(lando, validateRecipeIsLagoon),
  'lagoon-new-key': newKey(lando, validateRecipeIsLagoon),
});
