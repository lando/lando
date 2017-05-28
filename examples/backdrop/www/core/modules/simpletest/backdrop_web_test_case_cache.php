<?php
/**
 * Class for setting up a full installation profile for caching purposes.
 *
 * This class is used when using the run-tests.sh script and passing in the
 * --cache option. If used, then the script will initiate this class once per
 * installation profile. The installation profile will be fully installed and
 * set up, then used for all test runs that use that same profile.
 *
 * Note that no actual tests should be run using this class. This is only used
 * to install a profile, store it, and then exit.
 */
class BackdropWebTestCaseCache extends BackdropWebTestCase {
  /**
   * Set the installation profile to be used as a cache.
   */
  public function setProfile($profile) {
    $this->profile = $profile;
    // Create the database prefix for this test.
    $this->databasePrefix = 'simpletest_cache_' . $this->profile . '_';
    $this->fileDirectoryName = 'simpletest_cache_' . $this->profile;
  }

  /**
   * Check if cache folder already exists.
   *
   * @return
   *   TRUE if cache exists, FALSE if no cache for current profile.
   */
  public function isCached(){
    $file_public_path = config_get('system.core', 'file_public_path', 'files');
    $cache_dir = $file_public_path . '/simpletest/' . $this->fileDirectoryName;
    if (is_dir($cache_dir)) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Prepare cache tables and config directories.
   */
  public function prepareCache() {
    $this->setUp();
    // Speed up test speed by converting tables to MyISAM.
    $this->alterToMyISAM();
    $this->tearDown();
  }

  /**
   * Sets up a Backdrop site to be used as a cached installation profile.
   */
  protected function setUp(){
    global $conf;

    // Prepare the environment for running tests.
    $this->prepareEnvironment();
    if (!$this->setupEnvironment) {
      return FALSE;
    }

    // Reset all statics and variables to perform tests in a clean environment.
    $conf = array();
    backdrop_static_reset();

    // Change the database prefix.
    // All static variables need to be reset before the database prefix is
    // changed, since BackdropCacheArray implementations attempt to
    // write back to persistent caches when they are destructed.
    $this->changeDatabasePrefix();
    if (!$this->setupDatabasePrefix) {
      return FALSE;
    }

    // Preset the 'install_profile' system variable, so the first call into
    // system_rebuild_module_data() (in backdrop_install_system()) will register
    // the test's profile as a module. Without this, the installation profile of
    // the parent site (executing the test) is registered, and the test
    // profile's hook_install() and other hook implementations are never invoked.
    config_install_default_config('system');
    config_set('system.core', 'install_profile', $this->profile);

    // Perform the actual Backdrop installation.
    include_once BACKDROP_ROOT . '/core/includes/install.inc';
    backdrop_install_system();

    // Set path variables.
    $core_config = config('system.core');
    $core_config->set('file_default_scheme', 'public');
    $core_config->set('file_public_path', $this->public_files_directory);
    $core_config->set('file_private_path', $this->private_files_directory);
    $core_config->set('file_temporary_path', $this->temp_files_directory);
    $core_config->save();

    // Ensure schema versions are recalculated.
    backdrop_static_reset('backdrop_get_schema_versions');

    // Include the testing profile.
    config_set('system.core', 'install_profile', $this->profile);
    $profile_details = install_profile_info($this->profile, 'en');

    // Install the modules specified by the testing profile.
    module_enable($profile_details['dependencies'], FALSE);

    // Install the profile itself.
    $install_profile_module_exists = db_query("SELECT 1 FROM {system} WHERE type = 'module' AND name = :name", array(':name' => $this->profile))->fetchField();
    if ($install_profile_module_exists) {
      module_enable(array($this->profile), FALSE);
    }
    return TRUE;
  }

  /**
   * Reset the database prefix and global config.
   */
  protected function tearDown() {
    global $user, $language, $settings, $config_directories;
    // Get back to the original connection.
    Database::removeConnection('default');
    Database::renameConnection('simpletest_original_default', 'default');

    // Set the configuration directories back to the originals.
    $config_directories = $this->originalConfigDirectories;

    // Restore the original settings.
    $settings = $this->originalSettings;

    // Restore original shutdown callbacks array to prevent original
    // environment of calling handlers from test run.
    $callbacks = &backdrop_register_shutdown_function();
    $callbacks = $this->originalShutdownCallbacks;

    // Return the user to the original one.
    $user = $this->originalUser;
    backdrop_save_session(TRUE);

    // Ensure that internal logged in variable and cURL options are reset.
    $this->loggedInUser = FALSE;
    $this->additionalCurlOptions = array();

    // Reload module list and implementations to ensure that test module hooks
    // aren't called after tests.
    module_list(TRUE);
    module_implements_reset();

    // Reset the Field API.
    field_cache_clear();

    // Rebuild caches.
    $this->refreshVariables();

    // Reset public files directory.
    $GLOBALS['conf']['file_public_path'] = $this->originalFileDirectory;

    // Reset language.
    $language = $this->originalLanguage;
    if ($this->originalLanguageDefault) {
      $GLOBALS['conf']['language_default'] = $this->originalLanguageDefault;
    }

    // Close the CURL handler.
    $this->curlClose();
  }

  /**
   * Alter tables to MyISAM engine to speed up tests.
   *
   * MyISAM is faster to delete and copy tables. It gives small adventage when /var/lib/mysql on SHM (memory) device, but much bigger when tests run on regular device.
   */
  protected function alterToMyISAM() {
    $skip_alter = array(
      'taxonomy_term_data',
      'node',
      'node_access',
      'node_revision',
      'node_comment_statistics',
    );
    $tables = db_find_tables($this->databasePrefix . '%');
    foreach ($tables as $table) {
      $original_table_name = substr($table, strlen($this->databasePrefix));
      if(!in_array($original_table_name, $skip_alter)){
        db_query('ALTER TABLE ' . $table . ' ENGINE=MyISAM');
      }
    }
  }
}
