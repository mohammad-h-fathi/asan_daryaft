import secrets
from eth_account import Account
from web3 import Web3

# Enable un-audited HD wallet features if needed
Account.enable_unaudited_hdwallet_features()

class EVMEngine:
    @staticmethod
    def generate_real_evm_keypair():
        """
        Generates a cryptographically valid EVM private key and checksummed address.
        """
        acct = Account.create()
        return {
            'address': acct.address,
            'private_key': acct._private_key.hex()
        }

    @staticmethod
    def is_valid_evm_address(address: str) -> bool:
        if not address:
            return False
        return Web3.is_address(address)

    @staticmethod
    def calculate_dynamic_fee(source_usd_value: float):
        """
        Calculates dynamic platform commission tier based on USD transaction volume.
        - Tier 1 (< $500): 1.0%
        - Tier 2 ($500 - $5,000): 0.75%
        - Tier 3 (> $5,000): 0.50%
        """
        val = float(source_usd_value)
        if val < 500:
            return {
                'rate_percent': 1.0,
                'tier_name': 'سطح عادی (۱٪)',
                'fee_usd': (val * 1.0) / 100
            }
        elif val <= 5000:
            return {
                'rate_percent': 0.75,
                'tier_name': 'سطح نقره‌ای (۰.۷۵٪)',
                'fee_usd': (val * 0.75) / 100
            }
        else:
            return {
                'rate_percent': 0.50,
                'tier_name': 'سطح طلایی (۰.۵۰٪)',
                'fee_usd': (val * 0.50) / 100
            }

    @staticmethod
    def generate_mock_tx_hash():
        return '0x' + secrets.token_hex(32)
