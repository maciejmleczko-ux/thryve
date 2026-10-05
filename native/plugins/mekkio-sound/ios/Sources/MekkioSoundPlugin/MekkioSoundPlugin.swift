import Capacitor
import AudioToolbox

/// Plays an iOS system sound by its SystemSoundID. System sounds follow the
/// silent switch and never interrupt the user's music.
@objc(MekkioSoundPlugin)
public class MekkioSoundPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MekkioSoundPlugin"
    public let jsName = "MekkioSound"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise)
    ]

    @objc public func play(_ call: CAPPluginCall) {
        guard let id = call.getInt("id"), id > 0 else {
            call.reject("id required")
            return
        }
        AudioServicesPlaySystemSound(SystemSoundID(id))
        call.resolve()
    }
}
