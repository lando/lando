<template>
  <div id="hs_form_injector"></div>
</template>

<script>

// CSS
const hscss = `
  h1, h2, h3 {
    color: #fff;
    font-family: "Poppins", "Helvetica Neue", Arial, sans-serif;
    font-size: 4em;
    margin: 0;
    padding: 0;
    border: 0;
    letter-spacing: -1px;
    line-height: 1;
    padding-bottom: 1em;
  }
  form {
    margin: auto;
    padding: 5em;
    background-color: #024164;
  }
  .inputs-list label {
    line-height: 26px;
  }
  .inputs-list:first-child {
    padding-top: 2em;
  }
  .inputs-list .hs-form-checkbox  {
    padding-bottom: 2em;
  }
  .inputs-list .hs-form-checkbox span {
    color: #efefef;
  }
  .inputs-list .hs-form-checkbox small  {
    color: #daf2fe;
  }
  .inputs-list .hs-form-checkbox strong  {
    font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    text-align: center;
    color: #daf2fe;
    font-size: 1.4em;
    letter-spacing: 0;
  }
  .inputs-list .hs-form-checkbox  {
    color: #daf2fe;
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
    color: #daf2fe;
  }
  .hs_i_m_interested_in label span {
    color: #daf2fe;
  }
  @media (max-width: 400px) {
    form {
      padding: 3em;
    }
    h1, h2, h3 {
      font-size: 3em;
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
      default: 1100,
    },
    portal: {
      type: String,
      default: '6478338',
    },
  },
  mounted() {
    this.injectForm();
  },
  methods: {
    injectForm() {
      // Get and reset the element
      const hsFormInjector = document.getElementById('hs_form_injector');
      hsFormInjector.innerHTML = '';

      // Add the new script tag
      const injector = document.createElement('script');
      injector.type = 'text/javascript';
      injector.text = `hbspt.forms.create({
        portalId: '${this.portal}',
        formId: '${this.form}',
      });`;
      hsFormInjector.appendChild(injector);

      // Add a correction factor to height on smaller devices
      let height = this.height;
      if (window.screen.width < 800) {
        height = height + 830 - window.screen.width;
      }

      // Attempt to style the form
      const iid = setInterval(() => {
        if (document.getElementsByClassName('hs-form-iframe')[0] !== null) {
          const joinHTML = document.getElementsByClassName('hs-form-iframe')[0];
          joinHTML.contentDocument.body.innerHTML += `<style>${hscss}</style>`;
          joinHTML.style.height = `${height}px`;
          window.clearInterval(iid);
        }
      }, this.delay);
    },
  },
  watch: {
    form: function() {
      this.injectForm();
    },
  },
};
</script>

<style lang="stylus">
</style>
