<?php
/**
 * Plugin Name: FiveBot Chat
 * Plugin URI: https://github.com/FiveBot-ai/website-chat-examples
 * Description: The FiveBot website chat on every page, with logged-in users signed in.
 * Version: 1.0.0
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * Author: FiveBot
 * Author URI: https://fivebot.ai
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('FIVEBOT_SITE_KEY')) {
    define('FIVEBOT_SITE_KEY', 'pk_your_site_key');
}

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script('fivebot-chat', 'https://fivebot.ai/widget.js', [], null, ['in_footer' => true]);

    $user = wp_get_current_user();
    if (!$user->exists() || !defined('FIVEBOT_IDENTITY_SECRET')) {
        wp_add_inline_script(
            'fivebot-chat',
            "try{if(localStorage.getItem('fivebot:signed-in')){localStorage.removeItem('fivebot:signed-in');window.FiveBot&&window.FiveBot.reset();}}catch(e){}"
        );
        return;
    }

    $id = (string) $user->ID;
    $email = (string) $user->user_email;
    $identity = [
        'externalUserId' => $id,
        'name' => $user->display_name,
        'email' => $email,
        'signature' => hash_hmac('sha256', $email !== '' ? $id . "\n" . $email : $id, FIVEBOT_IDENTITY_SECRET),
    ];

    wp_add_inline_script(
        'fivebot-chat',
        'window.FiveBot&&window.FiveBot.identify(' . wp_json_encode($identity) . ");try{localStorage.setItem('fivebot:signed-in','1')}catch(e){}"
    );
});

add_filter('script_loader_tag', function ($tag, $handle) {
    if ($handle !== 'fivebot-chat') {
        return $tag;
    }
    return str_replace(' src=', ' data-key="' . esc_attr(FIVEBOT_SITE_KEY) . '" src=', $tag);
}, 10, 2);
