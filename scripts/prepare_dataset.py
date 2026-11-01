import os
import re
import pandas as pd
import numpy as np

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    return text.strip()

def map_disaster_type(keyword, text):
    text_lower = (str(keyword) + " " + str(text)).lower()
    
    if any(k in text_lower for k in ['flood', 'drown', 'deluge', 'inundat', 'water rising']):
        return 'Flood'
    elif any(k in text_lower for k in ['hurricane', 'cyclone', 'typhoon', 'tornado', 'twister', 'storm']):
        return 'Hurricane'
    elif any(k in text_lower for k in ['wildfire', 'forest fire', 'bushfire', 'fire', 'blaze', 'ablaze', 'arson']):
        return 'Wildfire'
    elif any(k in text_lower for k in ['earthquake', 'quake', 'aftershock', 'tremor', 'sismo', 'terremoto']):
        return 'Earthquake'
    elif any(k in text_lower for k in ['explosion', 'explod', 'blast', 'bomb']):
        return 'Explosion'
    elif any(k in text_lower for k in ['derail', 'crash', 'collision', 'accident']):
        return 'Accident'
    else:
        return 'Other'

def map_severity(text, is_disaster):
    if not is_disaster:
        return 'L0', 'None / Informational'
    
    text_lower = str(text).lower()
    
    # L3: Critical Rescue (trapped, casualties, dying, active life threat, urgent rescue)
    if any(k in text_lower for k in ['trapped', 'stranded', 'urgent', 'sos', 'mayday', 'rescue needed', 'save us', 'dying', 'casualties', 'life threat', 'roof', 'attic', 'under rubble', 'in suv']):
        return 'L3', 'Critical Rescue'
    
    # L2: Medium Urgency (infrastructure collapse, flooded home, medical need, shelter, food, power outage)
    elif any(k in text_lower for k in ['damage', 'collapsed', 'destroyed', 'cots', 'supplies', 'food', 'shelter', 'water needed', 'hospital', 'injured', 'broken', 'evacuate', 'homeless']):
        return 'L2', 'Medium Urgency'
    
    # L1: Low Urgency (traffic, road closed, delays, precautionary warning, weather update)
    elif any(k in text_lower for k in ['warning', 'advisory', 'closed', 'delay', 'traffic', 'caution', 'notice', 'reroute', 'power out', 'prepare']):
        return 'L1', 'Low Urgency'
    
    # L0: Informational / Sympathy / News
    else:
        return 'L0', 'Informational'

def map_event_name(location, text, keyword):
    combo = (str(location) + " " + str(text) + " " + str(keyword)).lower()
    
    if any(k in combo for k in ['florida', 'tampa', 'ian', 'idalia', 'fort myers', 'naples', 'orlando']):
        return 'Hurricane Ian (2022)'
    elif any(k in combo for k in ['philippines', 'manila', 'marikina', 'bopha', 'reliefph', 'rescueph']):
        return 'Philippines Floods (2012)'
    elif any(k in combo for k in ['guatemala', 'sismo', 'terremoto', 'san marcos']):
        return 'Guatemala Earthquake (2012)'
    elif any(k in combo for k in ['texas', 'waco', 'fertilizer', 'west texas']):
        return 'West Texas Explosion (2013)'
    elif any(k in combo for k in ['spain', 'santiago', 'galicia', 'derail']):
        return 'Spain Train Crash (2013)'
    elif any(k in combo for k in ['joplin', 'missouri', 'tornado']):
        return 'Joplin Tornado'
    elif any(k in combo for k in ['california', 'camp fire', 'paradise', 'wildfire']):
        return 'California Wildfires'
    else:
        return 'General Disaster Corpus'

def main():
    raw_path = 'data/disaster_tweets_raw.csv'
    if not os.path.exists(raw_path):
        print(f"Error: {raw_path} not found.")
        return

    print("Loading raw CSV...")
    df = pd.read_csv(raw_path, encoding='latin1')
    
    # Filter valid rows
    df = df[df['choose_one'].isin(['Relevant', 'Not Relevant'])].copy()
    
    # Clean text
    df['clean_text'] = df['text'].apply(clean_text)
    df = df[df['clean_text'].str.len() > 10].copy()
    
    df['is_disaster'] = (df['choose_one'] == 'Relevant').astype(int)
    
    # Map fields
    df['disaster_type'] = df.apply(
        lambda r: map_disaster_type(r['keyword'], r['clean_text']) if r['is_disaster'] == 1 else 'Non-Disaster',
        axis=1
    )
    
    sev_res = df.apply(lambda r: map_severity(r['clean_text'], r['is_disaster']), axis=1)
    df['severity_level'] = [s[0] for s in sev_res]
    df['urgency_label'] = [s[1] for s in sev_res]
    
    df['event_name'] = df.apply(
        lambda r: map_event_name(r['location'], r['clean_text'], r['keyword']),
        axis=1
    )
    
    # Select clean columns
    clean_df = pd.DataFrame({
        'id': range(1, len(df) + 1),
        'text': df['clean_text'],
        'disaster_type': df['disaster_type'],
        'severity_level': df['severity_level'],
        'urgency_label': df['urgency_label'],
        'event_name': df['event_name'],
        'keyword': df['keyword'].fillna(''),
        'location': df['location'].fillna(''),
        'is_disaster': df['is_disaster']
    })
    
    clean_path = 'data/disaster_tweets.csv'
    clean_df.to_csv(clean_path, index=False, encoding='utf-8')
    print(f"Saved cleaned dataset: {clean_path} with {len(clean_df)} records.")
    
    # Summary stats
    print("\nDisaster Types:")
    print(clean_df['disaster_type'].value_counts())
    print("\nSeverity Levels:")
    print(clean_df['severity_level'].value_counts())
    print("\nEvent Distribution:")
    print(clean_df['event_name'].value_counts().head(10))

if __name__ == '__main__':
    main()

