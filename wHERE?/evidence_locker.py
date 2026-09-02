import hashlib

evidence_text = "Aaron's original email"

# SHA-256 works with bytes, so convert the text into bytes.
evidence_bytes = evidence_text.________("utf-8")

# Create the SHA-256 fingerprint.
fingerprint = hashlib.________(evidence_bytes).________()

print(fingerprint)