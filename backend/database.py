"""
Simple Firestore client using REST API
No service account credentials needed for development
"""
import os
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "major-5d82e")
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "AIzaSyAcXVkkN62tTlmQJCYQVeRfjPb2jltd8eQ")

class FirestoreClient:
    """Simple Firestore REST API client"""
    
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents"
    
    def collection(self, name: str):
        """Get a collection reference"""
        return CollectionReference(self, name)

class CollectionReference:
    """Firestore collection reference"""
    
    def __init__(self, client: FirestoreClient, name: str):
        self.client = client
        self.name = name
        self.url = f"{client.base_url}/{name}"

    def get(self) -> List:
        """Get all documents in the collection"""
        return Query(self.client, self.name).get()
    
    def add(self, data: Dict) -> tuple:
        """Add a document to the collection"""
        # Convert Python types to Firestore types
        firestore_data = self._to_firestore_format(data)
        
        response = requests.post(
            self.url,
            json={"fields": firestore_data},
            params={"key": FIREBASE_API_KEY}
        )
        
        if response.status_code == 200:
            doc_data = response.json()
            doc_id = doc_data['name'].split('/')[-1]
            return (None, DocumentReference(self.client, self.name, doc_id, data))
        else:
            raise Exception(f"Failed to add document: {response.text}")
    
    def where(self, filter=None, **kwargs):
        """Query documents (simplified)"""
        return Query(self.client, self.name, filter)
    
    def document(self, doc_id: str):
        """Get a document reference"""
        return DocumentReference(self.client, self.name, doc_id)
    
    def _to_firestore_format(self, data: Dict) -> Dict:
        """Convert Python dict to Firestore format"""
        result = {}
        for key, value in data.items():
            result[key] = self._value_to_firestore(value)
        return result

    def _value_to_firestore(self, value):
        if isinstance(value, str):
            return {"stringValue": value}
        elif isinstance(value, bool):
            return {"booleanValue": value}
        elif isinstance(value, int):
            return {"integerValue": str(value)}
        elif isinstance(value, float):
            return {"doubleValue": value}
        elif isinstance(value, datetime):
            return {"timestampValue": value.isoformat() + "Z"}
        elif value is None:
            return {"nullValue": None}
        elif isinstance(value, dict):
            # MapValue
            return {"mapValue": {"fields": self._to_firestore_format(value)}}
        elif isinstance(value, list):
            # ArrayValue
            return {"arrayValue": {"values": [self._value_to_firestore(v) for v in value]}}
        else:
            return {"stringValue": str(value)}

class Query:
    """Firestore query"""
    
    def __init__(self, client: FirestoreClient, collection: str, filter_obj=None):
        self.client = client
        self.collection = collection
        self.filter_obj = filter_obj
        self._limit = None
    
    def limit(self, count: int):
        """Limit query results"""
        self._limit = count
        return self
    
    def get(self) -> List:
        """Execute the query"""
        # For simplicity, get all documents and filter in Python
        url = f"{self.client.base_url}/{self.collection}"
        response = requests.get(url, params={"key": FIREBASE_API_KEY})
        
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            
            # Convert to DocumentSnapshot objects
            results = []
            for doc in documents:
                doc_id = doc['name'].split('/')[-1]
                fields = self._from_firestore_format(doc.get('fields', {}))
                
                # Apply filter
                if self.filter_obj:
                    field = self.filter_obj.field
                    op = self.filter_obj.op
                    value = self.filter_obj.value
                    
                    if field in fields:
                        if op == "==" and fields[field] == value:
                            results.append(DocumentSnapshot(self.client, self.collection, doc_id, fields))
                else:
                    results.append(DocumentSnapshot(self.client, self.collection, doc_id, fields))
                
                if self._limit and len(results) >= self._limit:
                    break
            
            return results
        else:
            return []
    
    def _from_firestore_format(self, fields: Dict) -> Dict:
        """Convert Firestore format to Python dict"""
        result = {}
        for key, value in fields.items():
            result[key] = self._value_from_firestore(value)
        return result

    def _value_from_firestore(self, value):
        if 'stringValue' in value:
            return value['stringValue']
        elif 'booleanValue' in value:
            return value['booleanValue']
        elif 'integerValue' in value:
            return int(value['integerValue'])
        elif 'doubleValue' in value:
            return value['doubleValue']
        elif 'timestampValue' in value:
            return value['timestampValue']
        elif 'nullValue' in value:
            return None
        elif 'mapValue' in value:
            return self._from_firestore_format(value['mapValue'].get('fields', {}))
        elif 'arrayValue' in value:
            return [self._value_from_firestore(v) for v in value['arrayValue'].get('values', [])]
        else:
             # Fallback
             return str(value)

class FieldFilter:
    """Field filter for queries"""
    
    def __init__(self, field: str, op: str, value: Any):
        self.field = field
        self.op = op
        self.value = value

class DocumentReference:
    """Firestore document reference"""
    
    def __init__(self, client: FirestoreClient, collection: str, doc_id: str, data: Dict = None):
        self.client = client
        self.collection = collection
        self.id = doc_id
        self._data = data
        self.url = f"{client.base_url}/{collection}/{doc_id}"
    
    def update(self, data: Dict):
        """Update document"""
        firestore_data = CollectionReference(self.client, self.collection)._to_firestore_format(data)
        
        # Build update mask
        update_mask = "&".join([f"updateMask.fieldPaths={key}" for key in data.keys()])
        
        response = requests.patch(
            f"{self.url}?{update_mask}",
            json={"fields": firestore_data},
            params={"key": FIREBASE_API_KEY}
        )
        
        return response.status_code == 200

    def delete(self):
        """Delete document"""
        response = requests.delete(
            self.url,
            params={"key": FIREBASE_API_KEY}
        )
        return response.status_code == 200
    
    def get(self):
        """Get document data"""
        response = requests.get(self.url, params={"key": FIREBASE_API_KEY})
        
        if response.status_code == 200:
            doc = response.json()
            fields = Query(self.client, self.collection, None)._from_firestore_format(doc.get('fields', {}))
            return DocumentSnapshot(self.client, self.collection, self.id, fields)
        return None

class DocumentSnapshot:
    """Firestore document snapshot"""
    
    def __init__(self, client: FirestoreClient, collection: str, doc_id: str, data: Dict):
        self.client = client
        self.collection = collection
        self.id = doc_id
        self._data = data
        self.reference = DocumentReference(client, collection, doc_id, data)
    
    def to_dict(self) -> Dict:
        """Get document data as dict"""
        return self._data
    
    def exists(self) -> bool:
        """Check if document exists"""
        return self._data is not None

# Initialize client
_firestore_client = None

def get_firestore_db():
    """Get Firestore client"""
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = FirestoreClient(FIREBASE_PROJECT_ID)
    return _firestore_client

# Collection names
class Collections:
    USERS = 'users'
    DISPUTES = 'disputes'
    NOTIFICATIONS = 'notifications'
    CHATS = 'chats'
    MESSAGES = 'messages'
