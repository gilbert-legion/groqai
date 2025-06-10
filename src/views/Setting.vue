<template>
  <div class="settings-container">

    <div class="desc_text">
      The following settings are only retained locally in your browser.
      See <a :href="github_url" target="_blank">Github</a> for setup instructions.
    </div>

    <h1>LLM Provider</h1>
    <div class="desc_text">Choose your preferred LLM provider</div>
    <div class="separator">
      <el-radio-group v-model="llm_provider" @change="onProviderChange">
        <el-radio label="openai">OpenAI</el-radio>
        <el-radio label="groq">Groq</el-radio>
      </el-radio-group>
    </div>

    <!-- OpenAI Configuration -->
    <div v-show="llm_provider === 'openai'">
      <h1>OpenAI</h1>
      <div class="desc_text">To use GPT, you need an API Key from the <a :href="open_ai_api_url" target="_blank">OpenAI</a>
      </div>

      <div>
        <el-input placeholder="sk-xxxx" v-model="openai_key" @change="onKeyChange('openai_key')">
          <template slot="prepend">API Key:</template>
        </el-input>
      </div>

      <div class="separator">
        GPT Model:
        <el-radio-group v-model="gpt_model" @change="onKeyChange('gpt_model')">
          <el-radio label="gpt-3.5-turbo"></el-radio>
          <el-radio label="gpt-4"></el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- Groq Configuration -->
    <div v-show="llm_provider === 'groq'">
      <h1>Groq</h1>
      <div class="desc_text">To use Groq models, you need an API Key from <a :href="groq_api_url" target="_blank">Groq</a>
      </div>

      <div>
        <el-input placeholder="gsk_xxxx" v-model="groq_key" @change="onKeyChange('groq_api_key')">
          <template slot="prepend">API Key:</template>
        </el-input>
      </div>

      <div class="separator">
        Groq Model:
        <el-select v-model="groq_model" @change="onKeyChange('groq_model')" placeholder="Select a model" style="width: 100%">
          <el-option label="Gemma 2 9B IT" value="gemma2-9b-it"></el-option>
          <el-option label="Llama Guard 4 12B" value="meta-llama/llama-guard-4-12b"></el-option>
          <el-option label="Llama 3.3 70B Versatile" value="llama-3.3-70b-versatile"></el-option>
          <el-option label="Llama 3.1 8B Instant" value="llama-3.1-8b-instant"></el-option>
          <el-option label="Llama 3.3 70B 8192" value="llama-3.3-70b-8192"></el-option>
          <el-option label="Llama 3 8B 8192" value="llama-3-8b-8192"></el-option>
        </el-select>
      </div>
    </div>

    <div class="separator">
      <div class="desc_text">System Prompt:</div>
      <el-input type="textarea" placeholder="You can setup custom prompt here" :rows="5"
                v-model="gpt_system_prompt" @change="onKeyChange('gpt_system_prompt')"/>
    </div>


    <h1>Azure Speech Recognition</h1>
    <div class="desc_text">
      We use Microsoft Azure's speech recognition service. You can apply for a free Azure token by referring to <a
        :href="azure_application_url" target="_blank">this tutorial</a>:
    </div>
    <el-input placeholder="Input Your Azure Speech Resource Token (KEY 1)" v-model="azure_token"
              @change="onKeyChange('azure_token')">
      <template slot="prepend">Azure token:</template>
    </el-input>
    <div class="separator"></div>
    <el-input placeholder="e.g. eastasia" v-model="azure_region" @change="onKeyChange('azure_region')">
      <template slot="prepend">Location/Region</template>
    </el-input>
    <div class="separator"></div>
    <el-input placeholder="e.g. en-US" v-model="azure_language" @change="onKeyChange('azure_language')">
      <template slot="prepend">Recognition Language</template>
    </el-input>

    <div class="desc_text">
      <span style="text-decoration: gray">zh-CN</span> for Chinese, See <a :href="full_language_codec_url"
                                                                           target="_blank">here</a> for
      other language codes
    </div>

<!--    <div>-->
<!--      <el-button @click="toDef">set all setting to default</el-button>-->
<!--    </div>-->

  </div>
</template>

<script>
import config_util from "../utils/config_util"

export default {
  name: 'HelloWorld',
  props: {},
  data() {
    return {
      llm_provider: "openai",
      openai_key: "",
      gpt_model: "gpt-3.5-turbo",
      groq_key: "",
      groq_model: "llama-3.1-8b-instant",
      gpt_system_prompt: "",
      azure_token: "",
      azure_region: "",
      azure_language: "",
      open_ai_api_url: "https://platform.openai.com/api-keys",
      groq_api_url: "https://console.groq.com/keys",
      github_url: "https://github.com/interview-copilot/Interview-Copilot",
      azure_application_url: "https://github.com/interview-copilot/Interview-Copilot/blob/main/docs/azure_speech_service_tutorial.md",
      full_language_codec_url: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt#speech-to-text"
    }
  },
  mounted() {
    this.llm_provider = config_util.llm_provider()
    this.openai_key = localStorage.getItem("openai_key")
    this.groq_key = config_util.groq_api_key()
    this.gpt_system_prompt = config_util.gpt_system_prompt()
    this.gpt_model = config_util.gpt_model()
    this.groq_model = config_util.groq_model()
    this.azure_token = localStorage.getItem("azure_token")
    this.azure_region = config_util.azure_region()
    this.azure_language = config_util.azure_language()
  },
  methods: {
    onKeyChange(key_name) {
      console.log("setItem", key_name, this[key_name])
      if (key_name === 'groq_api_key') {
        localStorage.setItem(key_name, this.groq_key)
      } else {
        localStorage.setItem(key_name, this[key_name])
      }
    },
    onProviderChange() {
      console.log("Provider changed to:", this.llm_provider)
      localStorage.setItem("llm_provider", this.llm_provider)
    },
    toDef() {
      localStorage.clear();
    }
  }


}


</script>
<style scoped>

.settings-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 20px;
  min-height: calc(100vh - 80px);
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

.separator {
  margin-top: 10px;
}

.desc_text {
  color: var(--text-secondary);
  font-size: small;
  margin-bottom: 3px;
  transition: color 0.3s ease-in-out;
}

.desc_text a {
  color: var(--button-primary);
  transition: color 0.3s ease-in-out;
}

.desc_text a:hover {
  color: var(--button-primary-hover);
}

h1 {
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 15px;
  transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
}

/* Element UI component theming */
.settings-container >>> .el-input__inner {
  background-color: var(--input-bg) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.3s ease-in-out;
}

.settings-container >>> .el-input__inner:focus {
  border-color: var(--button-primary) !important;
}

.settings-container >>> .el-input-group__prepend {
  background-color: var(--bg-secondary) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.3s ease-in-out;
}

.settings-container >>> .el-textarea__inner {
  background-color: var(--input-bg) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.3s ease-in-out;
}

.settings-container >>> .el-textarea__inner:focus {
  border-color: var(--button-primary) !important;
}

.settings-container >>> .el-radio__label {
  color: var(--text-primary) !important;
  transition: color 0.3s ease-in-out;
}

.settings-container >>> .el-radio__input.is-checked .el-radio__inner {
  background-color: var(--button-primary) !important;
  border-color: var(--button-primary) !important;
}

.settings-container >>> .el-select .el-input__inner {
  background-color: var(--input-bg) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
}

.settings-container >>> .el-select-dropdown {
  background-color: var(--panel-bg) !important;
  border-color: var(--border-color) !important;
}

.settings-container >>> .el-option {
  background-color: var(--panel-bg) !important;
  color: var(--text-primary) !important;
}

.settings-container >>> .el-option:hover {
  background-color: var(--bg-secondary) !important;
}

.settings-container >>> .el-option.selected {
  background-color: var(--button-primary) !important;
  color: white !important;
}

</style>
