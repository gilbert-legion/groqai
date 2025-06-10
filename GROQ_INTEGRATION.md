# Groq LLM Integration for Interview Copilot

This document describes the enhanced Interview Copilot application with support for additional LLM models through Groq API integration.

## New Features

### Multiple LLM Provider Support
The application now supports both OpenAI and Groq as LLM providers, allowing users to choose their preferred service.

### Speech Recognition Panel Maximize/Minimize
Added a toggle button to maximize the Speech Recognition Results panel for better text visibility:
- **Location**: Top-right corner of the Speech Recognition Results panel
- **Icons**: Full-screen icon (maximize) and minus icon (minimize)
- **Functionality**: Expands the speech panel to full width while hiding the AI panel
- **Smooth Transitions**: CSS animations for seamless expand/collapse experience
- **Preserved Functionality**: All existing features work in both normal and maximized states

### Supported Groq Models
The following Groq models have been integrated:

1. **gemma2-9b-it** - Google's Gemma 2 9B Instruction Tuned model
2. **meta-llama/llama-guard-4-12b** - Meta's Llama Guard 4 12B model for content moderation
3. **llama-3.3-70b-versatile** - Meta's Llama 3.3 70B Versatile model
4. **llama-3.1-8b-instant** - Meta's Llama 3.1 8B Instant model (default)
5. **llama-3.3-70b-8192** - Meta's Llama 3.3 70B with 8192 context window
6. **llama-3-8b-8192** - Meta's Llama 3 8B with 8192 context window

## Setup Instructions

### 1. Get a Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key (it starts with `gsk_`)

### 2. Configure the Application
1. Open the Interview Copilot application
2. Navigate to the "Setting" page
3. Select "Groq" as your LLM Provider
4. Enter your Groq API key in the "API Key" field
5. Choose your preferred Groq model from the dropdown
6. Optionally, customize the system prompt

### 3. Using the Application
1. Configure Azure Speech Recognition (existing functionality)
2. Start the copilot to begin speech recognition
3. Click "Ask AI" to get responses from your selected Groq model

## Technical Implementation

### Files Modified
- `src/utils/config_util.js` - Added Groq configuration management
- `src/views/Setting.vue` - Added Groq provider selection and model configuration
- `src/views/HomeView.vue` - Added Groq API integration with streaming support
- `package.json` - Added groq-sdk dependency

### Key Features
- **Provider Selection**: Toggle between OpenAI and Groq providers
- **Model Selection**: Choose from 6 different Groq models
- **Streaming Support**: Real-time response streaming for both providers
- **Error Handling**: Comprehensive error handling for API failures
- **Configuration Persistence**: Settings saved in browser localStorage

### API Compatibility
The Groq integration follows the same patterns as the existing OpenAI integration:
- Streaming chat completions
- Same message format
- Compatible error handling
- Consistent user experience

## Error Handling

The application provides clear error messages for common issues:
- Missing API keys
- Invalid API keys
- Network connectivity issues
- Model-specific errors

## Development Notes

### Dependencies
- `groq-sdk`: Official Groq JavaScript/TypeScript SDK
- Maintains compatibility with existing OpenAI integration

### Configuration Management
All settings are stored in browser localStorage:
- `llm_provider`: Selected provider ("openai" or "groq")
- `groq_api_key`: Groq API key
- `groq_model`: Selected Groq model
- Existing OpenAI settings remain unchanged

## Troubleshooting

### Common Issues
1. **"You should setup GROQ API Token" error**
   - Ensure you've entered a valid Groq API key in Settings
   - Verify the key starts with `gsk_`

2. **Model not responding**
   - Check your internet connection
   - Verify the selected model is available
   - Try switching to a different Groq model

3. **Streaming issues**
   - Ensure your browser supports modern JavaScript features
   - Check browser console for detailed error messages

### Support
For issues specific to Groq models or API:
- Visit [Groq Documentation](https://console.groq.com/docs)
- Check [Groq Community](https://community.groq.com)

For general application issues:
- Visit the [Interview Copilot GitHub repository](https://github.com/interview-copilot/Interview-Copilot)
