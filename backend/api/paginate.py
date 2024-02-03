from flask import request, url_for


def paginate(model, schema):
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    page_obj = model.query.paginate(page=page, per_page=per_page)
    
    return {
            'total': page_obj.total,
            'pages': page_obj.pages,
            'page': page_obj.page,
            'per_page': per_page,
            'next': page_obj.next_num,
            'prev': page_obj.prev_num,
            'results': schema.dump(page_obj.items)
            }