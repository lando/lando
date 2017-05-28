<?php

/**
 * @file
 * Admin page callbacks for the Contact module.
 */

/**
 * Page callback: Lists contact categories.
 *
 * @see contact_menu()
 */
function contact_category_list() {

  $config_data = contact_config_data();
  $selected_category = $config_data['contact_default_category'];
  $categories = $config_data['categories'];

  $header = array(
    t('Category'),
    t('Recipients'),
    t('Selected'),
    t('Operations'),
  );
  $rows = array();

  // Loop through the categories and add them to the table.
  if ($categories) {
    foreach ($categories as $cat) {
      $row = array();
      $row[] = check_plain($cat['category']);
      $row[] = check_plain($cat['recipients']);

      if ($cat['cid'] == $selected_category) {
        $row[] = t('Yes');
      }
      else {
        $row[] = t('No');
      }

      $links = array();
      $links['configure'] = array(
        'title' => t('Configure'),
        'href' => 'admin/structure/contact/configure/' . $cat['cid'],
      );
      $links['delete'] = array(
        'title' => t('Delete'),
        'href' => 'admin/structure/contact/delete/' . $cat['cid'],
      );
      $row[] = array(
        'data' => array(
          '#type' => 'operations',
          '#links' => $links,
        ),
      );
      $rows[] = $row;
    }
  }

  if (!$rows) {
    $rows[] = array(array(
      'data' => t('No categories available.'),
      'colspan' => 5,
    ));
  }

  $build['category_table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
  );
  return $build;
}

/**
 * Form constructor for the category edit form.
 *
 * @param array $category
 *   An array describing the category to be edited. May be empty for new
 *   categories. Recognized array keys are:
 *   - category: The name of the category.
 *   - recipients: A comma-separated list of recipients.
 *   - reply: (optional) The body of the auto-reply message.
 *   - weight: The weight of the category.
 *   - selected: Boolean indicating whether the category should be selected by
 *     default.
 *   - cid: The category ID for which the form is to be displayed.
 *
 * @see contact_menu()
 * @see contact_category_edit_form_validate()
 * @see contact_category_edit_form_submit()
 * @ingroup forms
 */
function contact_category_edit_form($form, &$form_state, array $category = array()) {
  // If this is a new category, add the default values.
  $category += array(
    'category' => '',
    'recipients' => '',
    'reply' => '',
    'weight' => 0,
    'selected' => 0,
    'cid' => NULL,
  );

  // Get contact_default_category.
  $config_data = contact_config_data();
  $default_category = $config_data['contact_default_category'];

  // Check if selected.
  $selected = 0;
  if (isset($category['cid']) AND $default_category == $category['cid']) {
    $selected = 1;
  }

  $form['category'] = array(
    '#type' => 'textfield',
    '#title' => t('Category'),
    '#maxlength' => 255,
    '#default_value' => $category['category'],
    '#description' => t("Example: 'website feedback' or 'product information'."),
    '#required' => TRUE,
  );
  $form['recipients'] = array(
    '#type' => 'textarea',
    '#title' => t('Recipients'),
    '#default_value' => $category['recipients'],
    '#description' => t("Example: 'webmaster@example.com' or 'sales@example.com,support@example.com' . To specify multiple recipients, separate each e-mail address with a comma."),
    '#required' => TRUE,
  );
  $form['reply'] = array(
    '#type' => 'textarea',
    '#title' => t('Auto-reply'),
    '#default_value' => $category['reply'],
    '#description' => t('Optional auto-reply. Leave empty if you do not want to send the user an auto-reply message.'),
  );
  $form['weight'] = array(
    '#type' => 'weight',
    '#title' => t('Weight'),
    '#default_value' => $category['weight'],
    '#description' => t('When listing categories, those with lighter (smaller) weights get listed before categories with heavier (larger) weights. Categories with equal weights are sorted alphabetically.'),
  );
  $form['selected'] = array(
    '#type' => 'select',
    '#title' => t('Selected'),
    '#options' => array(
      0 => t('No'),
      1 => t('Yes'),
    ),
    '#default_value' => $selected,
    '#description' => t('Set this to <em>Yes</em> if you would like this category to be selected by default.'),
  );
  $form['cid'] = array(
    '#type' => 'hidden',
    '#value' => $category['cid'],
  );
  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );

  return $form;
}

/**
 * Form validation handler for contact_category_edit_form().
 *
 * @see contact_category_edit_form_submit()
 */
function contact_category_edit_form_validate($form, &$form_state) {
  // Validate and each e-mail recipient.
  $recipients = explode(',', $form_state['values']['recipients']);

  // When creating a new contact form, or renaming the category on an existing
  // contact form, make sure that the given category is unique.
  $category = $form_state['values']['category'];

  // Get Categories Data.
  $config_data = contact_config_data();
  $categories = $config_data['categories'];

  if ($categories) {
    foreach ($categories as $cat) {
      if ($form_state['values']['cid'] != $cat['cid'] AND $category == $cat['category']) {
        if (empty($form_state['values']['cid'])) {
          form_set_error('category', t('A contact form with category %category already exists.', array('%category' => $category)));
        }
      }
    }
  }

  // Check recipients are valid email.
  foreach ($recipients as &$recipient) {
    $recipient = trim($recipient);
    if (!valid_email_address($recipient)) {
      form_set_error('recipients', t('%recipient is an invalid e-mail address.', array('%recipient' => $recipient)));
    }
  }
  $form_state['values']['recipients'] = implode(',', $recipients);
  // Store $config_data in $form_state for use in form_submit().
  $form_state['categories_data'] = $config_data;
}

/**
 * Form submission handler for contact_category_edit_form().
 *
 * @see contact_category_edit_form_validate()
 */
function contact_category_edit_form_submit($form, &$form_state) {

  $cid = $form_state['values']['cid'];

  $contact = array(
    'cid' => $cid,
    'category' => $form_state['values']['category'],
    'recipients' => $form_state['values']['recipients'],
    'reply' => $form_state['values']['reply'],
    'weight' => $form_state['values']['weight'],
  );

  // Get Categories Data stored in $form_state.
  $config_data = $form_state['categories_data'];
  $default_category = $config_data['contact_default_category'];
  $categories = $config_data['categories'];

  if (isset($cid)) {
    foreach ($categories as $key => $val) {
      if ($val['cid'] == $cid) {
        $categories[$key] = $contact;
      }
    }
  }
  else {
    $max_cid = 0;
    if ($categories) {
      foreach ($categories as $key => $cat) {
        $cids[] = $cat['cid'];
      }
      $max_cid = max($cids);
    }

    $cid = $max_cid + 1;
    $contact['cid'] = $cid;
    $categories[] = $contact;
  }

  // If selected set variable contact_default_category.
  if ($form_state['values']['selected']) {
    $config_data['contact_default_category'] = $cid;
  }
  elseif ($cid == $default_category) {
    // If not selected but is set as default then set default back to 0.
    $config_data['contact_default_category'] = 0;
  }

  $config_data['categories'] = array_values($categories);

  $config = config('contact.categories');
  $config->setData($config_data);
  $config->save();

  backdrop_set_message(t('Category %category has been saved.', array('%category' => $form_state['values']['category'])));
  watchdog('contact', 'Category %category has been saved.', array('%category' => $form_state['values']['category']), WATCHDOG_NOTICE, l(t('Configure'), 'admin/structure/contact/configure/' . $form_state['values']['cid']));
  $form_state['redirect'] = 'admin/structure/contact';
}

/**
 * Form constructor for the contact category deletion form.
 *
 * @param array $contact
 *   Array describing the contact category to be deleted. See the documentation
 *   of contact_category_edit_form() for the recognized keys.
 *
 * @see contact_menu()
 * @see contact_category_delete_form_submit()
 */
function contact_category_delete_form($form, &$form_state, array $contact) {
  $form['contact'] = array(
    '#type' => 'value',
    '#value' => $contact,
  );

  return confirm_form(
    $form,
    t('Are you sure you want to delete %category?', array('%category' => $contact['category'])),
    'admin/structure/contact',
    t('This action cannot be undone.'),
    t('Delete'),
    t('Cancel')
  );
}

/**
 * Form submission handler for contact_category_delete_form().
 */
function contact_category_delete_form_submit($form, &$form_state) {

  $contact = $form['contact']['#value'];

  // Get Categories Data.
  $config_data = contact_config_data();
  $default_catageory = $config_data['contact_default_category'];
  $categories = $config_data['categories'];

  foreach ($categories as $key => $cat) {
    if ($cat['cid'] == $contact['cid']) {

      unset($categories[$key]);

      if ($cat['cid'] == $default_catageory) {
        $config_data['contact_default_category'] = 0;
      }

      break;
    }
  }

  $config_data['categories'] = array_values($categories);

  $config = config('contact.categories');
  $config->setData($config_data);
  $config->save();

  backdrop_set_message(t('Category %category has been deleted.', array('%category' => $contact['category'])));
  watchdog('contact', 'Category %category has been deleted.', array('%category' => $contact['category']), WATCHDOG_NOTICE);

  $form_state['redirect'] = 'admin/structure/contact';
}
