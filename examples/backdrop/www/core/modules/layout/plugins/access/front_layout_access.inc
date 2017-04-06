<?php
/**
 * @file
 * Class for loading, modifying, and saving a layout access rule (condition).
 */
class FrontLayoutAccess extends LayoutAccessNegatable {
  /**
   * {@inheritdoc}
   */
  function form(&$form, &$form_state) {
    parent::form($form, $form_state);
    $form['negate'] = array(
      '#type' => 'radios',
      '#title' => t('Current path is'),
      '#options' => array(
        0 => t('The front page'),
        1 => t('Any page except the front page'),
      ),
      '#weight' => 100,
      '#default_value' => (int) $this->settings['negate'],
    );
  }

  /**
   * {@inheritdoc}
   */
  function checkAccess() {
    if ($this->settings['negate']) {
      return !backdrop_is_front_page();
    }
    else {
      return backdrop_is_front_page();
    }
  }

  /**
   * {@inheritdoc}
   */
  function summary() {
    return $this->settings['negate'] ? t('Is not the front page') : t('Is the front page');
  }
}
