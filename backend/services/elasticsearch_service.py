from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from typing import List, Dict, Any, Tuple
from datetime import datetime
from config import settings

class ElasticsearchService:
    def __init__(self):
        self.es_host = settings.ES_HOST
        self.es_port = settings.ES_PORT
        
        self.es_client = Elasticsearch(
            [f"http://{self.es_host}:{self.es_port}"],
            max_retries=3,
            retry_on_timeout=True,
            request_timeout=30,
            verify_certs=False
        )
        
        self.WARNING_INDEX = "warnings"
        self.SEARCH_LOG_INDEX = "search_logs"
        
        # FIXED: ĐÃ XÓA "boost": 2 KHỎI TITLE
        self.WARNING_MAPPING = {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 1,
                "analysis": {
                    "analyzer": {
                        "vi_analyzer": {
                            "tokenizer": "standard",
                            "filter": ["lowercase", "asciifolding"]
                        }
                    }
                }
            },
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "scammer_name": {
                        "type": "text",
                        "analyzer": "vi_analyzer",
                        "fields": {"keyword": {"type": "keyword"}}
                    },
                    "bank_account": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword"}}
                    },
                    "bank_name": {"type": "keyword"},
                    "facebook_link": {"type": "keyword"},
                    "title": {"type": "text", "analyzer": "vi_analyzer"},  # ĐÃ XÓA "boost": 2
                    "content": {"type": "text", "analyzer": "vi_analyzer"},
                    "category": {"type": "keyword"},
                    "status": {"type": "keyword"},
                    "search_combined": {"type": "text", "analyzer": "vi_analyzer"},
                    "reporter_name": {"type": "keyword"},
                    "reporter_zalo": {"type": "keyword"},
                    "view_count": {"type": "integer"},
                    "search_count": {"type": "integer"},
                    "warning_count": {"type": "integer"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "approved_at": {"type": "date"}
                }
            }
        }
        
        self.SEARCH_LOG_MAPPING = {
            "mappings": {
                "properties": {
                    "search_query": {"type": "text"},
                    "search_type": {"type": "keyword"},
                    "user_id": {"type": "keyword"},
                    "ip_address": {"type": "keyword"},
                    "result_count": {"type": "integer"},
                    "created_at": {"type": "date"}
                }
            }
        }
        
        self._create_indices()
    
    def _create_indices(self):
        try:
            if not self.es_client.indices.exists(index=self.WARNING_INDEX):
                self.es_client.indices.create(index=self.WARNING_INDEX, body=self.WARNING_MAPPING)
                print(f"✅ Created index: {self.WARNING_INDEX}")
            
            if not self.es_client.indices.exists(index=self.SEARCH_LOG_INDEX):
                self.es_client.indices.create(index=self.SEARCH_LOG_INDEX, body=self.SEARCH_LOG_MAPPING)
                print(f"✅ Created index: {self.SEARCH_LOG_INDEX}")
        except Exception as e:
            print(f"❌ Error creating indices: {e}")
    
    def warning_to_doc(self, warning: Any) -> Dict[str, Any]:
        search_combined = " ".join([
            warning.scammer_name or "",
            warning.bank_account or "",
            warning.facebook_link or "",
            warning.title or "",
            warning.content or ""
        ])
        
        return {
            "id": str(warning.id),
            "scammer_name": warning.scammer_name,
            "bank_account": warning.bank_account,
            "bank_name": warning.bank_name,
            "facebook_link": warning.facebook_link,
            "title": warning.title,
            "content": warning.content,
            "category": warning.category.value if hasattr(warning.category, 'value') else warning.category,
            "status": warning.status.value if hasattr(warning.status, 'value') else warning.status,
            "search_combined": search_combined,
            "reporter_name": warning.reporter_name,
            "reporter_zalo": warning.reporter_zalo,
            "view_count": warning.view_count,
            "search_count": warning.search_count,
            "warning_count": warning.warning_count,
            "created_at": warning.created_at.isoformat() if warning.created_at else None,
            "updated_at": warning.updated_at.isoformat() if warning.updated_at else None,
            "approved_at": warning.approved_at.isoformat() if warning.approved_at else None
        }
    
    def index_warning(self, warning: Any):
        try:
            doc = self.warning_to_doc(warning)
            self.es_client.index(index=self.WARNING_INDEX, id=doc["id"], document=doc)
        except Exception as e:
            print(f"❌ Error indexing warning {warning.id}: {e}")
    
    def bulk_index_warnings(self, warnings: List[Any]):
        if not warnings:
            return
        
        actions = []
        for warning in warnings:
            try:
                doc = self.warning_to_doc(warning)
                actions.append({
                    "_index": self.WARNING_INDEX,
                    "_id": doc["id"],
                    "_source": doc
                })
            except Exception as e:
                print(f"❌ Error preparing warning {warning.id}: {e}")
        
        if actions:
            try:
                success, failed = bulk(self.es_client, actions)
                print(f"✅ Bulk indexed: {success} successful, {len(failed)} failed")
            except Exception as e:
                print(f"❌ Bulk indexing error: {e}")
    
    def update_warning(self, warning: Any):
        try:
            doc = self.warning_to_doc(warning)
            self.es_client.update(index=self.WARNING_INDEX, id=doc["id"], doc=doc)
        except Exception as e:
            print(f"❌ Error updating warning {warning.id}: {e}")
    
    def delete_warning(self, warning_id: str):
        try:
            self.es_client.delete(index=self.WARNING_INDEX, id=str(warning_id))
        except:
            pass
    
    def search_warnings(self, query_string: str, search_type: str = None, page: int = 1, page_size: int = 20) -> Tuple[List[str], int]:
        start_from = (page - 1) * page_size
        
        if search_type == "phone" or search_type == "bank_account":
            query = {"match": {"bank_account": {"query": query_string}}}
        elif search_type == "facebook":
            query = {"match": {"facebook_link": {"query": query_string}}}
        else:
            query = {
                "multi_match": {
                    "query": query_string,
                    "fields": ["scammer_name^10", "bank_account^8", "search_combined^5", "title^3", "content^1"],
                    "type": "best_fields",
                    "fuzziness": "AUTO",
                    "operator": "and"
                }
            }
        
        search_body = {
            "track_total_hits": True,
            "query": {"bool": {"must": query, "filter": [{"term": {"status": "approved"}}]}},
            "sort": [{"_score": {"order": "desc"}}, {"created_at": {"order": "desc"}}],
            "from": start_from,
            "size": page_size,
            "_source": ["id"]
        }
        
        try:
            response = self.es_client.search(index=self.WARNING_INDEX, body=search_body)
            total_hits = response["hits"]["total"]["value"]
            warning_ids = [hit["_id"] for hit in response["hits"]["hits"]]
            return warning_ids, total_hits
        except Exception as e:
            print(f"❌ Elasticsearch search error: {e}")
            return [], 0
    
    def log_search(self, search_data: Dict[str, Any]):
        try:
            self.es_client.index(index=self.SEARCH_LOG_INDEX, document=search_data)
        except Exception as e:
            print(f"❌ Error logging search: {e}")
    
    def get_top_searches(self, days: int = 1, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            query = {
                "size": 0,
                "query": {"range": {"created_at": {"gte": f"now-{days}d/d", "lte": "now/d"}}},
                "aggs": {
                    "top_searches": {
                        "terms": {"field": "search_query.keyword", "size": limit, "order": {"_count": "desc"}}
                    }
                }
            }
            
            response = self.es_client.search(index=self.SEARCH_LOG_INDEX, body=query)
            buckets = response["aggregations"]["top_searches"]["buckets"]
            return [{"query": bucket["key"], "search_count": bucket["doc_count"]} for bucket in buckets]
        except Exception as e:
            print(f"❌ Error getting top searches: {e}")
            return []
    
    def get_top_scammers(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            query = {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"status": "approved"}},
                            {"range": {"created_at": {"gte": f"now-{days}d/d", "lte": "now/d"}}}
                        ]
                    }
                },
                "aggs": {
                    "top_scammers": {
                        "terms": {"field": "scammer_name.keyword", "size": limit, "order": {"_count": "desc"}},
                        "aggs": {
                            "bank_accounts": {"terms": {"field": "bank_account.keyword", "size": 1}}
                        }
                    }
                }
            }
            
            response = self.es_client.search(index=self.WARNING_INDEX, body=query)
            buckets = response["aggregations"]["top_scammers"]["buckets"]
            result = []
            
            for bucket in buckets:
                bank_account = ""
                if bucket["bank_accounts"]["buckets"]:
                    bank_account = bucket["bank_accounts"]["buckets"][0]["key"]
                result.append({
                    "scammer_name": bucket["key"],
                    "bank_account": bank_account,
                    "warning_count": bucket["doc_count"]
                })
            return result
        except Exception as e:
            print(f"❌ Error getting top scammers: {e}")
            return []
    
    def reindex_all_warnings(self, warnings: List[Any]):
        print("🔄 Starting reindex of all warnings...")
        try:
            if self.es_client.indices.exists(index=self.WARNING_INDEX):
                self.es_client.indices.delete(index=self.WARNING_INDEX)
        except:
            pass
        
        self._create_indices()
        self.bulk_index_warnings(warnings)
        print(f"✅ Reindex completed: {len(warnings)} warnings indexed")
    
    def health_check(self) -> bool:
        try:
            return self.es_client.ping()
        except:
            return False

# Global instance
es_service = ElasticsearchService()