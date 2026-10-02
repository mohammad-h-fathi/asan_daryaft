import hashlib
import hmac
import secrets
import json
import base64

ALTCHA_SECRET = 'miloosh-altcha-secret-key-2026'

class AltchaService:
    @staticmethod
    def generate_challenge(max_number=50000):
        """
        Generates ALTCHA PoW Challenge
        """
        salt = secrets.token_hex(12)
        number = secrets.randbelow(max_number)
        
        # Challenge string = SHA-256(salt + number)
        challenge_input = f"{salt}{number}".encode('utf-8')
        challenge_hash = hashlib.sha256(challenge_input).hexdigest()

        # Signature HMAC
        sig = hmac.new(ALTCHA_SECRET.encode('utf-8'), challenge_hash.encode('utf-8'), hashlib.sha256).hexdigest()

        return {
            'algorithm': 'SHA-256',
            'challenge': challenge_hash,
            'salt': salt,
            'signature': sig,
            'maxnumber': max_number
        }

    @staticmethod
    def verify_solution(payload_b64):
        """
        Verifies ALTCHA PoW Payload submitted by client
        """
        if not payload_b64:
            return False, 'پاسخ چالش امنیتی (ALTCHA) ارسال نشده است.'

        try:
            # Decode base64 JSON payload
            raw_json = base64.b64decode(payload_b64).decode('utf-8')
            data = json.loads(raw_json)

            algorithm = data.get('algorithm')
            challenge = data.get('challenge')
            salt = data.get('salt')
            signature = data.get('signature')
            number = data.get('number')

            if algorithm != 'SHA-256':
                return False, 'الگوریتم چالش نامعتبر است.'

            # 1. Verify HMAC Signature
            expected_sig = hmac.new(ALTCHA_SECRET.encode('utf-8'), challenge.encode('utf-8'), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected_sig, signature):
                return False, 'امضای چالش امنیتی باطل شده است.'

            # 2. Verify PoW solution
            check_input = f"{salt}{number}".encode('utf-8')
            check_hash = hashlib.sha256(check_input).hexdigest()

            if check_hash != challenge:
                return False, 'پاسخ چالش امنیتی (Proof of Work) نادرست است.'

            return True, None
        except Exception as e:
            return False, f'خطا در اعتبارسنجی پاسخ چالش امنیتی: {str(e)}'
