import re

DISPOSABLE_EMAIL_DOMAINS = {
    'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 
    'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'dispostable.com', 
    'trashmail.com', 'yopmail.com', 'yopmail.fr', 'getnada.com', 'fakeinbox.com', 
    'sharklasers.com', 'throwawaymail.com', 'maildrop.cc', 'crazymailing.com', 
    'minutemail.com', 'mohmal.com', 'bmail.com', 'mytemp.email', 'tempail.com',
    'generator.email', 'emailondeck.com', 'tempmailo.com', 'inboxkitten.com',
    'dropmail.me', 'disposablemail.com', 'trashmail.net', '0815.ru', '10minutemail.net'
}

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

class EmailValidator:
    @staticmethod
    def validate_email(email: str):
        if not email or not isinstance(email, str):
            return False, 'ایمیل وارد شده معتبر نیست.'
        
        email_clean = email.strip().lower()
        if not EMAIL_REGEX.match(email_clean):
            return False, 'فرمت ایمیل وارد شده صحیح نیست.'

        domain = email_clean.split('@')[-1]
        if domain in DISPOSABLE_EMAIL_DOMAINS:
            return False, 'استفاده از سرویس‌های ایمیل موقت و یک‌بار مصرف مجاز نیست. لطفاً یک ایمیل معتبر و واقعی وارد کنید.'

        return True, None
