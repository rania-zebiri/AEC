def caesar_cipher(text, shift, mode='encrypt'):
    result = ""
    
    if mode == 'decrypt':
        shift = -shift

    for char in text:
        if char.isupper():
            result += chr((ord(char) - 65 + shift) % 26 + 65)
        elif char.islower():
            result += chr((ord(char) - 97 + shift) % 26 + 97)
        else:
            result += char
            
    return result

def main():
    print("--- CTF Caesar Cipher Tool ---")
    message = input("Enter your message: ")
    shift = int(input("Enter shift value (1-25): "))
    mode = input("Mode (encrypt/decrypt): ").lower()

    output = caesar_cipher(message, shift, mode)
    print(f"\nResult: {output}")

if __name__ == "__main__":
    main()