class Delib:

    def __init__(self, community = None):
        self.statements = Storage('statements')
        self.parameters = Storage('parameters')['parameters']
        self.community = community
        if not self.parameters.exists():
            self.parameters['topics'] = []
            self.parameters['counter'] = 1
            self.parameters['ranking_topics'] = {}

    def approve_partner(self, partner):
        return True

    def create_statement(self, parent, text):
        if parent and parent not in self.statements:
            parent = None
        _counter = self.parameters['counter']
        self.parameters['counter'] = _counter + 1
        _record = {'parent': parent, 'kids': [],
                   'owner': master(), 'text': text,
                   'ranking_kids': {}, 'counter': _counter}
        _sid = str(_counter).zfill(15)
        self.statements[_sid] = _record
        if parent:
            self.statements[parent]['kids'] = self.statements[parent]['kids'] + [_sid]
        else:
            self.parameters['topics'] = self.parameters['topics'] + [_sid]

    def update_statement(self, sid, mode,
                         parents, kids, text, tags):
        pass

    def delete_statement(self, sid):
        if sid in self.statements:
            record = self.statements[sid]
            if record['owner'] == master() and not record['kids']:
                parent = record['parent']
                if parent and parent in self.statements:
                    kids = self.statements[parent]['kids']
                    if sid in kids:
                        kids.remove(sid)
                    self.statements[parent]['kids'] = kids
                elif sid in self.parameters['topics']:
                    kids = self.parameters['topics']
                    if sid in kids:
                        kids.remove(sid)
                    self.parameters['topics'] = kids
                del self.statements[sid]

    def set_ranking(self, sid, order):
        if sid in self.statements:
            _counter = self.parameters['counter']
            self.parameters['counter'] = _counter + 1
            self.statements[sid] = {f'ranking_kids.{master()}': order, 'counter': _counter}
        else:
            self.parameters['ranking_topics'] = {master(): order}

    def delete_ranking(self, sid):
        pass

    def get_statements(self, parent):
        parent_statement = None
        ranking_topics = None
        if parent:
            parent_statement = self.statements[parent].get_dict()
            sids = self.statements[parent]['kids']
        else:
            ranking_topics = self.parameters['ranking_topics']
            sids = self.parameters['topics']
        kids = {sid: self.statements[sid].get_dict() for sid in sids}
        return {'parent': parent_statement, 'kids': kids, 'ranking_topics': ranking_topics}

    def get_updates(self, counter):
        return self.statements.get('counter', '>', counter)
