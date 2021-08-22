#!python3
import json
import os
from collections import defaultdict

signpost_file = "signpost.json"
private_signpost_folder = "private-signpost"
public_signpost_folder = "public-signpost"
private_signpost_file = f'{private_signpost_folder}/signpost.json'
public_signpost_file = f'{private_signpost_folder}/signpost.json'

public_signpost_fields = [
    "name",
    "description",
    "url",
]
private_signpost_fields = [
    "username",
    "password",
] 
all_signpost_fields = public_signpost_fields + private_signpost_fields
auxillary_fields = [
    "private"
]

def is_private(website):
    private = False
    for field in private_signpost_fields:
        if field in website:
            private = True
    return private or ("private" in website and website["private"])

def create_signpost_for_fields(output_file, signpost_fields, include_private=False):
    signpost = []
    with open(signpost_file) as f_in:
        full_signpost = json.load(f_in)
        for website in full_signpost:
            if (is_private(website) and not include_private):
                continue
            signpost.append({
                field: website[field] if field in website else None for field in signpost_fields
            })
    with open(output_file, 'w') as f_out:
        json.dump(signpost, f_out, ensure_ascii=False, indent=4)
    print(f'wrote signposts to {output_file} for the following websites')
    for website in signpost:
        website_url = website['url']
        print(f'\t{website_url}')

if __name__=="__main__":
    create_signpost_for_fields(
            private_signpost_file,
            all_signpost_fields,
            include_private = True)
    create_signpost_for_fields(
            public_signpost_file,
            public_signpost_fields,
            include_private = False)
