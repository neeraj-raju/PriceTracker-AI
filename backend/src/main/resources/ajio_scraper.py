import sys
import json
import re
from curl_cffi import requests

def scrape_ajio(url):
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
    }
    
    try:
        # We use Safari impersonation because Akamai blocks Chrome/Firefox/Edge curl_cffi requests
        response = requests.get(url, headers=headers, impersonate="safari", timeout=20)
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code} from Ajio server"}
            
        html = response.text
        
        # Look for type="application/ld+json" blocks
        ld_json_blocks = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>([\s\S]*?)</script>', html)
        
        product_data = None
        for block in ld_json_blocks:
            try:
                data = json.loads(block.strip())
                if isinstance(data, dict):
                    # We are looking for the ProductGroup or Product block
                    if data.get("@type") in ["ProductGroup", "Product"]:
                        product_data = data
                        break
            except Exception:
                continue
                
        if not product_data:
            return {"error": "Could not locate product JSON-LD data block in page HTML."}
            
        # 1. Name: Brand + Name
        brand_name = "Ajio"
        brand = product_data.get("brand")
        if brand and isinstance(brand, dict):
            brand_name = brand.get("name", "Ajio")
            
        prod_name = product_data.get("name", "Tracked Product")
        full_name = f"{brand_name} - {prod_name}"
        
        # 2. Price
        price = "0"
        offers = product_data.get("offers")
        if offers:
            if isinstance(offers, dict):
                price = str(offers.get("price", "0"))
            elif isinstance(offers, list) and len(offers) > 0:
                price = str(offers[0].get("price", "0"))
                
        # 3. Image
        image_url = product_data.get("image", "")
        if isinstance(image_url, list) and len(image_url) > 0:
            image_url = image_url[0]
            
        # 4. Rating
        rating = "N/A"
        aggregate_rating = product_data.get("aggregateRating")
        if aggregate_rating and isinstance(aggregate_rating, dict):
            rating = str(aggregate_rating.get("ratingValue", "N/A"))
            
        # 5. Availability
        availability = "In Stock"
        if offers and isinstance(offers, dict):
            avail_str = str(offers.get("availability", ""))
            if "OutOfStock" in avail_str or "LimitedAvailability" in avail_str:
                # Note: LimitedAvailability on Ajio can mean in stock but low quantity, let's treat it as In Stock unless it's explicitly OutOfStock.
                # Actually, if we see price is valid, it's generally in stock.
                pass
            if "OutOfStock" in avail_str:
                availability = "Out of Stock"
                
        return {
            "name": full_name,
            "price": price,
            "imageUrl": image_url,
            "rating": rating,
            "availability": availability,
            "website": "AJIO"
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        sys.exit(1)
        
    res = scrape_ajio(sys.argv[1])
    print(json.dumps(res))
