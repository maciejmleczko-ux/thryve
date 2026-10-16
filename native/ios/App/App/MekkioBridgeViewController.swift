import UIKit
import Capacitor

// Capacitor wyłącza domyślnie bounce (scrollView.bounces = false). Mekkio chce gumki na przewijanych ekranach.
class MekkioBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.scrollView.bounces = true
    }
}
