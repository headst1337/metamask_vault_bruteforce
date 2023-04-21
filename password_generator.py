import random
import string

def generate_passwords(num_passwords, min_length, max_length):
    passwords = []
    characters = string.ascii_letters + string.digits + string.punctuation

    for _ in range(num_passwords):
        password_length = random.randint(min_length, max_length)
        password = ''.join(random.choice(characters) for _ in range(password_length))
        passwords.append(password)

    return passwords

num_passwords = 100000
min_length = 8
max_length = 12

passwords = generate_passwords(num_passwords, min_length, max_length)

with open('pass.txt', 'w') as file:
    file.write('\n'.join(passwords))

print(f'Successfully generated {num_passwords} passwords and saved them to pass.txt file.')
