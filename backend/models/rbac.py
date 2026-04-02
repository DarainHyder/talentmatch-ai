from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(100), primary_key=True)  # Auth0/Google ID
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    avatar = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    roles = db.relationship('UserRole', backref='user', lazy=True)
    tenant_id = db.Column(db.String(100), db.ForeignKey('tenants.id'))

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # 'admin', 'recruiter'
    description = db.Column(db.String(255))
    
    permissions = db.relationship('RolePermission', backref='role', lazy=True)

class Permission(db.Model):
    __tablename__ = 'permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(100), unique=True, nullable=False)  # 'create:job'
    name = db.Column(db.String(255))
    description = db.Column(db.String(500))

class RolePermission(db.Model):
    __tablename__ = 'role_permissions'
    
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), primary_key=True)
    permission_id = db.Column(db.Integer, db.ForeignKey('permissions.id'), primary_key=True)

class UserRole(db.Model):
    __tablename__ = 'user_roles'
    
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), primary_key=True)
    tenant_id = db.Column(db.String(100), db.ForeignKey('tenants.id'))
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    plan = db.Column(db.String(50), default='free')  # multi-tenant support
    created_at = db.Column(db.DateTime, default=datetime.utcnow)