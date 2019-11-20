<template>
  <script>
    hbspt.forms.create({
      portalId: '{{ portal }}',
      formId: '{{ form }}',
    });
  </script>
</template>

<script>

// CSS
const hscss = `
  h1, h2, h3 {
    color: #f06292;
    font-weight: 600;
    font-size: 2.4em;
    margin: 0;
    padding-bottom: 1em;
  }
  .inputs-list label {
    line-height: 26px;
  }
  form {
    margin: auto;
    padding: 5em;
    border: 1px #ed3f7a solid;
  }
  .inputs-list:first-child {
    padding-top: 2em;
  }
  .inputs-list .hs-form-checkbox  {
    padding-bottom: 2em;
  }
  .inputs-list .hs-form-checkbox small  {
    color: #4e6e8e;
  }
  .multi-container {
    padding-bottom: 1em;
  }
  .hs-custom-style fieldset input:not([type="image"]):not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]), .hs-custom-style>div input:not([type="image"]):not([type="submit"]):not([type="button"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]) {
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto;
    color: initial;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: start;
    -webkit-appearance: textfield;
    background-color: white;
    -webkit-rtl-ordering: logical;
    cursor: text;
    margin: 0em;
    font: 400 11px system-ui;
    padding: 1px;
    border-width: 2px;
    border-style: inset;
    border-color: initial;
    border-image: initial;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 80px 10px 20px;
    height: 50px;
    border-radius: 50px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
  .hs-available_for_contract_work label.hs-form-booleancheckbox-display {
    margin-top: -38px;
    font-size: 1em;
  }
  .hs-available_for_contract_work label.hs-form-booleancheckbox-display span {
    color: #4e6e8e;
  }
  @media (max-width: 750px) {
    form {
      margin: auto;
      padding: 0;
      border: 0;
    }
  }
`;

export default {
  data() {
    return {};
  },
  props: {
    delay: {
      type: Number,
      default: 500,
    },
    form: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      default: 1000,
    },
    portal: {
      type: String,
      default: '6478338',
    },
  },
  mounted() {
    // Let's inject some CSS to make things look a bit nicer but add some
    // nasty recursion just to make sure everthing is in order
    const iid = setInterval(() => {
      if (document.getElementsByClassName('hs-form-iframe')[0] !== null) {
        const joinHTML = document.getElementsByClassName('hs-form-iframe')[0];
        joinHTML.contentDocument.body.innerHTML += `<style>${hscss}</style>`;
        joinHTML.style.height = `${this.height}px`;
        window.clearInterval(iid);
      }
    }, this.delay);
  },
};
</script>

<style lang="stylus">
</style>
