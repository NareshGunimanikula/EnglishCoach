package com.linguaflowai81

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TeluguSpeechModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), RecognitionListener {

  private var speechRecognizer: SpeechRecognizer? = null
  private var pendingPromise: Promise? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  private val timeoutHandler = Handler(Looper.getMainLooper())
  private var isListening = false

  override fun getName(): String = "TeluguSpeechModule"

  @ReactMethod
  fun startListening(promise: Promise) {
    pendingPromise = promise

    mainHandler.post {
      try {
        Log.e("LinguaFlowAI81", "startListening called")

        if (isListening) {
          try {
            speechRecognizer?.cancel()
          } catch (_: Exception) {
          }
          isListening = false
        }

        if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
          pendingPromise?.reject(
            "NOT_AVAILABLE",
            "Speech recognition is not available on this device"
          )
          pendingPromise = null
          return@post
        }

        if (speechRecognizer == null) {
          speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
          speechRecognizer?.setRecognitionListener(this)
          Log.e("LinguaFlowAI81", "SpeechRecognizer created")
        } else {
          speechRecognizer?.cancel()
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
          putExtra(
            RecognizerIntent.EXTRA_LANGUAGE_MODEL,
            RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
          )
          putExtra(RecognizerIntent.EXTRA_LANGUAGE, "te-IN")
          putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "te-IN")
          putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
          putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
          putExtra(
            RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS,
            4500L
          )
          putExtra(
            RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS,
            4500L
          )
          putExtra(
            RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS,
            2500L
          )
        }

        isListening = true
        speechRecognizer?.startListening(intent)
        Log.e("LinguaFlowAI81", "SpeechRecognizer startListening invoked")

        timeoutHandler.removeCallbacksAndMessages(null)
        timeoutHandler.postDelayed({
          if (pendingPromise != null) {
            Log.e("LinguaFlowAI81", "Speech timeout: no result returned")
            isListening = false
            try {
              speechRecognizer?.cancel()
            } catch (_: Exception) {
            }
            pendingPromise?.reject("TIMEOUT", "No speech result returned")
            pendingPromise = null
          }
        }, 10000L)
      } catch (e: Exception) {
        Log.e("LinguaFlowAI81", "START_ERROR: ${e.message}", e)
        isListening = false
        pendingPromise?.reject("START_ERROR", e.message, e)
        pendingPromise = null
      }
    }
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    mainHandler.post {
      try {
        timeoutHandler.removeCallbacksAndMessages(null)
        isListening = false
        speechRecognizer?.stopListening()
        speechRecognizer?.cancel()
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("STOP_ERROR", e.message, e)
      }
    }
  }

  @ReactMethod
  fun destroyRecognizer(promise: Promise) {
    mainHandler.post {
      try {
        timeoutHandler.removeCallbacksAndMessages(null)
        isListening = false
        speechRecognizer?.destroy()
        speechRecognizer = null
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("DESTROY_ERROR", e.message, e)
      }
    }
  }

  override fun onReadyForSpeech(params: Bundle?) {
    Log.e("LinguaFlowAI81", "onReadyForSpeech")
  }

  override fun onBeginningOfSpeech() {
    Log.e("LinguaFlowAI81", "onBeginningOfSpeech")
  }

  override fun onRmsChanged(rmsdB: Float) {
  }

  override fun onBufferReceived(buffer: ByteArray?) {
  }

  override fun onEndOfSpeech() {
    Log.e("LinguaFlowAI81", "onEndOfSpeech")
  }

  override fun onPartialResults(partialResults: Bundle?) {
    Log.e("LinguaFlowAI81", "onPartialResults")
  }

  override fun onEvent(eventType: Int, params: Bundle?) {
  }

  override fun onError(error: Int) {
    timeoutHandler.removeCallbacksAndMessages(null)

    val wasListening = isListening
    isListening = false

    if(!wasListening && error == SpeechRecognizer.ERROR_CLIENT){
      pendingPromise = null
      return
    }

    val message = when (error) {
      SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
      SpeechRecognizer.ERROR_CLIENT -> "Client error"
      SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission not granted"
      SpeechRecognizer.ERROR_NETWORK -> "Network error"
      SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
      SpeechRecognizer.ERROR_NO_MATCH -> "No speech matched"
      SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy"
      SpeechRecognizer.ERROR_SERVER -> "Server error"
      SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
      else -> "Speech recognition error: $error"
    }
    
    pendingPromise?.reject("SPEECH_ERROR", message)
    pendingPromise = null
  }

  override fun onResults(results: Bundle?) {
    timeoutHandler.removeCallbacksAndMessages(null)
    isListening = false

    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
    val text = matches?.firstOrNull()

    Log.e("LinguaFlowAI81", "onResults: $text")

    if (!text.isNullOrBlank()) {
      pendingPromise?.resolve(text)
    } else {
      pendingPromise?.reject("NO_RESULT", "No speech recognized")
    }

    pendingPromise = null
  }
}