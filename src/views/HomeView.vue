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
            type="text"
            aria-label="Toggle maximize speech panel"
            :title="isAsrMaximized ? 'Minimize Speech Panel' : 'Maximize Speech Panel'"
          ></el-button>
        </div>
        <div v-if="!currentText" class="no-content-text">No Content</div>
        <div class="asr_content">{{ currentText }}</div>
        <div class="single_part_bottom_bar">
          <el-button icon="el-icon-delete" :disabled="!currentText" @click="clearASRContent">
            Clear Text
          </el-button>
        </div>
      </div>
      <div
        class="box ai-panel"
        :class="{
          'ai-maximized': isAiMaximized,
          'ai-minimized': isAiMinimized,
          'hidden': isAsrMaximized
        }"
        style="border-left: none;"
      >
        <div class="func_desc">
          <i class="el-icon-s-custom"></i>
          AI Answer
          <el-button
            class="ai-maximize-btn"
            :icon="isAiMaximized ? 'el-icon-minus' : 'el-icon-full-screen'"
            @click="toggleAiMaximize"
            size="mini"
            type="text"
            aria-label="Toggle maximize AI panel"
            :title="isAiMaximized ? 'Minimize AI Panel' : 'Maximize AI Panel'"
            tabindex="0"
          ></el-button>
          <el-button
            class="ai-minimize-btn"
            :icon="isAiMinimized ? 'el-icon-bottom-right' : 'el-icon-bottom'"
            @click="toggleAiMinimize"
            size="mini"
            type="text"
            aria-label="Toggle minimize AI panel"
            :title="isAiMinimized ? 'Restore AI Panel' : 'Minimize AI Panel'"
            tabindex="0"
            style="right: 36px;"
          ></el-button>
        </div>
        <transition name="ai-panel-transition">
          <div v-show="!isAiMinimized" class="ai-panel-content">
            <LoadingIcon v-show="show_ai_thinking_effect"/>
            <div class="ai_result_content">{{ ai_result }}</div>
            <div class="single_part_bottom_bar">
              <el-button icon="el-icon-thumb" @click="askCurrentText" :disabled="!isGetAIAnswerAvailable">
                Ask AI
              </el-button>
            </div>
          </div>
        </transition>
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

const AI_PANEL_MAXIMIZED_KEY = 'ai_panel_maximized'
const AI_PANEL_MINIMIZED_KEY = 'ai_panel_minimized'

export default {
  name: 'HomeView',
  props: {},
  computed: {
    isDevMode() {
      return (process.env.NODE_ENV === 'development')
    },
    isGetAIAnswerAvailable() {
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
      isAiMaximized: false,
      isAiMinimized: false,
    }
  },
  async mounted() {
    if (this.isDevMode) {
      // this.currentText = demo_text
    }
    // Restore AI panel maximize/minimize state
    this.isAiMaximized = localStorage.getItem(AI_PANEL_MAXIMIZED_KEY) === 'true'
    this.isAiMinimized = localStorage.getItem(AI_PANEL_MINIMIZED_KEY) === 'true'
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
    toggleAiMaximize() {
      this.isAiMaximized = !this.isAiMaximized
      if (this.isAiMaximized) {
        this.isAiMinimized = false
      }
      localStorage.setItem(AI_PANEL_MAXIMIZED_KEY, this.isAiMaximized)
      localStorage.setItem(AI_PANEL_MINIMIZED_KEY, this.isAiMinimized)
    },
    toggleAiMinimize() {
      this.isAiMinimized = !this.isAiMinimized
      if (this.isAiMinimized) {
        this.isAiMaximized = false
      }
      localStorage.setItem(AI_PANEL_MINIMIZED_KEY, this.isAiMinimized)
      localStorage.setItem(AI_PANEL_MAXIMIZED_KEY, this.isAiMaximized)
    },
    async startCopilot() {
      this.copilot_starting = true
      const token = localStorage.getItem("azure_token")
      const region = config_util.azure_region()
      const language = config_util.azure_language()
      const provider = config_util.llm_provider()
      const llm_api_key = config_util.current_api_key()
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
  transition: height 0.3s cubic-bezier(.4,0,.2,1);
}

.box {
  flex: 1;
  border: 1px solid var(--panel-border);
  background-color: var(--panel-bg);
  padding: 10px;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
  color: var(--text-primary);
  min-width: 0;
  min-height: 0;
}

.box.maximized {
  flex: 1 1 100%;
}

.ai-panel {
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
  position: relative;
}

.ai-panel.ai-maximized {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: calc(100vh - 110px);
  z-index: 10;
  background: var(--panel-bg);
  box-shadow: 0 0 16px var(--shadow-medium);
  border-radius: 0 0 8px 8px;
  border: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 10px;
  animation: ai-panel-maximize-in 0.3s;
}

@keyframes ai-panel-maximize-in {
  from { transform: scale(0.95); opacity: 0.5; }
  to { transform: scale(1); opacity: 1; }
}

.ai-panel.ai-minimized .ai-panel-content {
  display: none;
}

.ai-panel.ai-minimized {
  max-height: 48px;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
  transition: max-height 0.3s cubic-bezier(.4,0,.2,1);
}

.ai-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: opacity 0.3s cubic-bezier(.4,0,.2,1);
}

.ai-panel.hidden {
  flex: 0 0 0;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border: none;
}

.func_desc {
  text-align: center;
  position: relative;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.func_desc i {
  margin-right: 8px;
  color: var(--button-primary);
}

.maximize-btn,
.ai-maximize-btn,
.ai-minimize-btn {
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

.ai-minimize-btn {
  right: 36px;
}

.maximize-btn:hover,
.ai-maximize-btn:hover,
.ai-minimize-btn:hover {
  color: var(--button-primary) !important;
  background-color: var(--bg-secondary) !important;
}

.maximize-btn:focus,
.ai-maximize-btn:focus,
.ai-minimize-btn:focus {
  outline: 2px solid var(--button-primary);
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

.ai-panel-transition-enter-active,
.ai-panel-transition-leave-active {
  transition: opacity 0.3s cubic-bezier(.4,0,.2,1);
}
.ai-panel-transition-enter, .ai-panel-transition-leave-to {
  opacity: 0;
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

/* Responsive: make sure maximized panel covers on small screens */
@media (max-width: 900px) {
  .ai-panel.ai-maximized {
    width: 100vw;
    left: 0;
    border-radius: 0;
  }
}
</style>
