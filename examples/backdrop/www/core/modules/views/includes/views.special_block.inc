<?php

/**
 * Displays special Views blocks, such as the Exposed Filters block.
 */
class ViewsSpecialBlock extends Block {
  /**
   * {@inheritdoc}
   */
  function getContent() {
    $output = array(
      '#markup' => '',
    );

    list(, $type, $name, $display_id) = explode('-', $this->delta);
    // Put the - back on.
    $type = '-' . $type;
    if ($view = views_get_view($name)) {
      if ($view->access($display_id)) {
        $view->set_display($display_id);
        if (isset($view->display_handler)) {
          $special_block = $view->display_handler->view_special_blocks($type);
          $output['#markup'] = $special_block['content'];
          views_add_contextual_links($output, 'special_block_' . $type, $view, $display_id);
        }
      }
      $view->destroy();
    }

    return $output;
  }
}
