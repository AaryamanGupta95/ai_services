from geopy.distance import geodesic

def _distance_km(cust_lat, cust_lon, prov_lat, prov_lon):
    return geodesic((cust_lat, cust_lon), (prov_lat, prov_lon)).km

def calculate_location_score(customer, provider):
    """
    Spec:
      - if distance exists → 1/(1+distance_km)
      - else → 1 if same city, else 0
    """
    c_lat = customer.get('latitude')
    c_lon = customer.get('longitude')
    p_lat = provider.get('latitude')
    p_lon = provider.get('longitude')
    c_city = customer.get('city')
    p_city = provider.get('city')

    if c_lat is not None and c_lon is not None and p_lat is not None and p_lon is not None:
        try:
            dist = _distance_km(c_lat, c_lon, p_lat, p_lon)
            return 1.0 / (1.0 + dist)
        except Exception:
            return 0.0

    if c_city and p_city and str(c_city).strip().lower() == str(p_city).strip().lower():
        return 1.0

    return 0.0

def get_best_provider(customer, providers):
    best_provider = None
    best_score = -1

    for p in providers:
        rating = float(p.get('rating') or 0.0)  # expected 0-5
        experience = float(p.get('experience') or 0.0)  # years

        # normalize
        norm_rating = max(0.0, min(rating / 5.0, 1.0))
        norm_exp = max(0.0, min(experience / 10.0, 1.0))
        availability = 1.0 if p.get('available', False) else 0.0
        location_score = calculate_location_score(customer, p)

        # score = 0.4*rating + 0.3*experience + 0.2*availability + 0.1*location_score
        score = (norm_rating * 0.4) + (norm_exp * 0.3) + (availability * 0.2) + (location_score * 0.1)

        if availability <= 0.0:
            continue

        if score > best_score:
            best_score = score
            best_provider = p
                  
    return best_provider, best_score
