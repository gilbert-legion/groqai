<template>
  <div class="homeview_container">
    <div class="center_container">
      <div class="box" :class="{ 'maximized': isAsrMaximized }">
        <div class="func_desc">
          <i class="el-icon-microphone"></i>
          Speech Recognition Results
          <el-button
            class="maximize-btn"
            :icon="isAsrMaximized ? 'el-icon-minus' : 'el-icon-full-screen'"
            @click="toggleAsrMaximize"
            size="mini"
            type="text">
          </el-button>
        </div>
        <div v-if="!currentText" class="no-content-text">No Content</div>
        <div class="asr_content">{{ currentText }}</div>
        <div class="single_part_bottom_bar">
          <el-button icon="el-icon-delete" :disabled="!currentText" @click="clearASRContent">
            Clear Text
          </el-button>
        </div>
      </div>
      <div class="box ai-panel" :class="{ 'hidden': isAsrMaximized }" style="border-left: none;">
        <div class="func_desc">
          <i class="el-icon-s-custom"></i>
          AI Answer
        </div>
        <LoadingIcon v-show="show_ai_thinking_effect"/>
        <div class="ai_result_content">{{ ai_result }}</div>
        <div class="single_part_bottom_bar">
          <el-button icon="el-icon-thumb" @click="askCurrentText" :disabled="!isGetAIAnswerAvailable">
            Ask AI
          </el-button>
        </div>
      </div>
    </div>
    <div class="title_function_bar">
      <el-button
          type="success"
          @click="startCopilot" v-show="state==='end'" :loading="copilot_starting"
          :disabled="copilot_starting">Start Copilot
      </el-button>
      <el-button
          :loading="copilot_stopping"
          @click="userStopCopilot" v-show="state==='ing'">Stop Copilot
      </el-button>
      <MyTimer ref="MyTimer"/>
    </div>

  </div>
</template>

<script>
import Assert from "assert-js"
import LoadingIcon from "@/components/LoadingIcon.vue";
import MyTimer from "@/components/MyTimer.vue";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import OpenAI from "openai";
import Groq from "groq-sdk";
import config_util from "../utils/config_util"

export default {
  name: 'HomeView',
  props: {},
  computed: {
    isDevMode() {
      return (process.env.NODE_ENV === 'development')
    },
    isGetAIAnswerAvailable() {
      // return this.state === "ing" && !!this.currentText
      return !!this.currentText

    }
  },
  components: {LoadingIcon, MyTimer},
  data() {
    return {
      currentText: "",
      state: "end", //end\ing
      ai_result: null,
      copilot_starting: false, //显示loading
      copilot_stopping: false,
      show_ai_thinking_effect: false,
      popStyle: {},
      isAsrMaximized: false, // Track maximize state for ASR panel
    }
  },
  async mounted() {
    console.log("mounted")
    if (this.isDevMode) {
      // this.currentText = demo_text
    }
  },
  beforeDestroy() {
  },
  methods: {
    async askCurrentText() {
      const provider = config_util.llm_provider()
      const apiKey = config_util.current_api_key()
      const model = config_util.current_model()
      let content = this.currentText
      this.ai_result = ""
      this.show_ai_thinking_effect = true
      const gpt_system_prompt = config_util.gpt_system_prompt()
      content = gpt_system_prompt + "\n" + content

      try {
        if (!apiKey) {
          throw new Error(`You should setup an API Key for ${provider.toUpperCase()}!`)
        }

        if (provider === "groq") {
          await this.askGroq(apiKey, model, content)
        } else {
          await this.askOpenAI(apiKey, model, content)
        }
      } catch (e) {
        this.show_ai_thinking_effect = false
        this.ai_result = "" + e
      }
    },

    async askOpenAI(apiKey, model, content) {
      const openai = new OpenAI({apiKey: apiKey, dangerouslyAllowBrowser: true})
      const stream = await openai.chat.completions.create({
        model: model,
        messages: [{role: "user", content: content}],
        stream: true,
      });
      this.show_ai_thinking_effect = false

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ""
        this.ai_result += text
      }
    },

    async askGroq(apiKey, model, content) {
      const groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      })

      const stream = await groq.chat.completions.create({
        model: model,
        messages: [{role: "user", content: content}],
        stream: true,
      });
      this.show_ai_thinking_effect = false

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ""
        this.ai_result += text
      }
    },
    clearASRContent() {
      this.currentText = ""
    },
    toggleAsrMaximize() {
      this.isAsrMaximized = !this.isAsrMaximized
    },
    async startCopilot() {
      this.copilot_starting = true
      const token = localStorage.getItem("azure_token")
      const region = config_util.azure_region()
      const language = config_util.azure_language()
      const provider = config_util.llm_provider()
      const llm_api_key = config_util.current_api_key()
      console.log({region, language, provider})
      try {
        if (!llm_api_key) {
          throw new Error(`You should setup ${provider.toUpperCase()} API Token`)
        }
        if (!token) {
          throw new Error("You should setup Azure token")
        }
        if (!region) {
          throw new Error("You should setup Azure region")
        }

        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(token, region);
        speechConfig.speechRecognitionLanguage = language;
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      } catch (e) {
        this.currentText = e
        this.copilot_starting = false
        return
      }

      const recognizer = this.recognizer
      const sdk = SpeechSDK


      recognizer.recognized = (sender, event) => {
        if (sdk.ResultReason.RecognizedSpeech === event.result.reason && event.result.text.length > 0) {
          const text = event.result.text
          this.currentText = this.currentText + "\n" + text
        } else if (sdk.ResultReason.NoMatch === event.result.reason) {
          console.log("Speech could not be recognized")
        }
      };

      recognizer.startContinuousRecognitionAsync(
          () => {
            this.copilot_starting = false
            this.state = "ing"
            this.$refs.MyTimer.start()
            window.console.log("recognition started");
          },
          (err) => {
            this.copilot_starting = false
            this.currentText = "Start Failed:" + err
            window.console.error("recogniton start failed", err);
          })
    },
    userStopCopilot() {
      this.copilot_stopping = true
      this.recognizer.stopContinuousRecognitionAsync(() => {
        console.log("stoped")
        this.copilot_stopping = false
        this.state = "end"
        this.$refs.MyTimer.stop()
      }, (err) => {
        console.log("err:", err)
      })
    }
  }
}


const demo_text = `
Hello, thank you for coming for the interview. Please introduce yourself.

I'm Jhon, currently an undergraduate student majoring in Data Science at HK University. I am in the top 10% of my class, specializing in deep learning and proficient in web development. Additionally, I have contributed to several well-known open-source projects as mentioned in my resume.

Alright, let me ask you a machine learning question.

Sure, go ahead.

Can you explain the Hidden Markov Model?
`

async function sleep(ms) {
  return new Promise((resolve => setTimeout(resolve, ms)))
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.homeview_container {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

.title_function_bar {
  margin-top: 10px;
  text-align: center;
  margin-bottom: 10px;
}

.center_container {
  flex-grow: 1;
  display: flex;
  height: calc(100vh - 150px);
}

.box {
  flex: 1;
  border: 1px solid var(--panel-border);
  background-color: var(--panel-bg);
  padding: 10px;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
  color: var(--text-primary);
}

.box.maximized {
  flex: 1 1 100%; /* Take full width when maximized */
}

.ai-panel.hidden {
  flex: 0 0 0; /* Hide AI panel when ASR is maximized */
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border: none;
}

.asr_content {
  overflow-y: auto;
  flex-grow: 1;
  color: var(--text-primary);
  background-color: var(--panel-bg);
}

.func_desc {
  text-align: center;
  position: relative;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.func_desc i {
  margin-right: 8px;
  color: var(--button-primary);
}

.maximize-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary) !important;
  font-size: 16px !important;
  padding: 4px !important;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
  background: transparent !important;
  border: none !important;
}

.maximize-btn:hover {
  color: var(--button-primary) !important;
  background-color: var(--bg-secondary) !important;
}

.single_part_bottom_bar {
  display: flex;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

.single_part_bottom_bar > .el-button {
  flex-grow: 1;
}

.ai_result_content {
  overflow-y: auto;
  flex-grow: 1;
  color: var(--text-primary);
  background-color: var(--panel-bg);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
  min-height: 100px;
}

.popup-tag {
  position: absolute;
  display: none;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 5px;
  font-size: 15px;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.error_msg {
  color: #f56c6c;
  text-align: center;
}

.no-content-text {
  color: var(--text-placeholder);
  text-align: center;
  font-style: italic;
  padding: 20px;
}

</style>
