// const def_prompt = `The following is a transcript of an interview dialogue. Please extract the last question asked by the interviewer and provide an answer. If it is an algorithm question, please provide the approach and code implementation. If no question is found, there is no need to respond.`


function gpt_system_prompt() {
    return localStorage.getItem("gpt_system_prompt")
}

function azure_language() {
    return localStorage.getItem("azure_language") || "en-US"
}

function azure_region() {
    return localStorage.getItem("azure_region") || "eastasia"
}

function gpt_model() {
    return localStorage.getItem("gpt_model") || "gpt-3.5-turbo"
}

// LLM Provider functions
function llm_provider() {
    return localStorage.getItem("llm_provider") || "openai"
}

function groq_api_key() {
    return localStorage.getItem("groq_api_key")
}

function groq_model() {
    return localStorage.getItem("groq_model") || "llama-3.1-8b-instant"
}

// Get the currently selected model based on provider
function current_model() {
    const provider = llm_provider()
    if (provider === "groq") {
        return groq_model()
    }
    return gpt_model()
}

// Get the currently selected API key based on provider
function current_api_key() {
    const provider = llm_provider()
    if (provider === "groq") {
        return groq_api_key()
    }
    return localStorage.getItem("openai_key")
}

export default {
    gpt_system_prompt,
    azure_language,
    azure_region,
    gpt_model,
    llm_provider,
    groq_api_key,
    groq_model,
    current_model,
    current_api_key
}