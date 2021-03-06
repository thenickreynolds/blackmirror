package net.nickreynolds.magicmirror.magicmirror

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v7.app.AppCompatActivity
import android.util.Log
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import com.wonderkiln.camerakit.CameraKit
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    private val WINDOW_FLAGS = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setImmersive()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        setContentView(R.layout.activity_main)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE), 0)
        }

        webView.webViewClient = WebViewClient()

        @Suppress("UsePropertyAccessSyntax")
        webView.settings.setJavaScriptEnabled(true)
        
        webView.settings.setAppCacheEnabled(false)
        webView.settings.cacheMode = WebSettings.LOAD_NO_CACHE

        WebView.setWebContentsDebuggingEnabled(true)

        webView.loadUrl("https://gday.today")

        camera.facing = CameraKit.Constants.FACING_FRONT

        tick()
    }

    private fun tick() {
        if (isDestroyed) {
            return
        }

        val interval = 30 * 1000L
//        val interval = 5 * 1000L
        Handler(Looper.getMainLooper()).postDelayed({ tick() }, interval)

        camera.start()
        camera.captureImage({
            runOnUiThread({
                analyzeBitmapAndAdjustBrightness(it.bitmap)
                camera.stop()
            })
        })
    }

    private fun analyzeBitmapAndAdjustBrightness(bitmap: Bitmap) {
        val brightness_low = 0f
        val brightness_high = 0.7f
        val threshhold = 50

        val photoBrightness = calculateBrightnessEstimate(bitmap)
        val brightness = if (photoBrightness > threshhold) brightness_high else brightness_low

        Log.d("BRIGHTNESS", "Adjusting to $brightness because of photo being $photoBrightness")
//        Toast.makeText(this, "Adjusting to $brightness because of photo being $photoBrightness", Toast.LENGTH_LONG).show()

        val layoutParams = window.attributes
        layoutParams.screenBrightness = brightness
        window.attributes = layoutParams
    }

    override fun onResume() {
        super.onResume()
        camera.start()
    }

    override fun onPause() {
        camera.stop()
        super.onPause()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            window.decorView.systemUiVisibility = WINDOW_FLAGS
        }
    }

    /*
    Calculates the estimated brightness of an Android Bitmap.
    pixelSpacing tells how many pixels to skip each pixel. Higher values result in better performance, but a more rough estimate.
    When pixelSpacing = 1, the method actually calculates the real average brightness, not an estimate.
    This is what the calculateBrightness() shorthand is for.
    Do not use values for pixelSpacing that are smaller than 1.

    https://gist.github.com/bodyflex/b1d772caf76cdc0c11e2
    */
    private fun calculateBrightnessEstimate(bitmap: android.graphics.Bitmap, pixelSpacing: Int = 1): Int {
        var red = 0
        var green = 0
        var blue = 0
        val height = bitmap.height
        val width = bitmap.width
        var pixelCount = 0
        val pixels = IntArray(width * height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        var i = 0
        while (i < pixels.size) {
            val color = pixels[i]
            red += Color.red(color)
            green += Color.green(color)
            blue += Color.blue(color)
            pixelCount++
            i += pixelSpacing
        }
        return (red + blue + green) / (pixelCount * 3)
    }

    private fun setImmersive() {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN)

        val decorView = window.decorView
        decorView.setOnSystemUiVisibilityChangeListener { visibility ->
            if (visibility and View.SYSTEM_UI_FLAG_FULLSCREEN == 0) {
                decorView.systemUiVisibility = WINDOW_FLAGS
            }
        }
    }
}
